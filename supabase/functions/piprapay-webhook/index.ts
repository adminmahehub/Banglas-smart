import { createClient } from "jsr:@supabase/supabase-js@2";

// PipraPay server-to-server notification (deploy with verify_jwt = false).
// Trust model: the request must carry our API key in the mh-piprapay-api-key header, AND the payment is
// re-checked with PipraPay (verify-payments) before any credit is added. Credits are added once (piprapay_mark_paid is idempotent).
const BASE = (Deno.env.get("PIPRAPAY_BASE_URL") ?? "").replace(/\/+$/, "");
const KEY = Deno.env.get("PIPRAPAY_API_KEY") ?? "";
const j = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });

function sameKey(a: string, b: string) {
  if (!a || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return j({ status: false, message: "method_not_allowed" }, 405);
  if (!BASE || !KEY) return j({ status: false, message: "not_configured" }, 503);
  const got = req.headers.get("mh-piprapay-api-key") ?? req.headers.get("Mh-Piprapay-Api-Key") ?? "";
  if (!sameKey(got, KEY)) return j({ status: false, message: "Unauthorized request." }, 401);

  let p: any = {};
  try { p = await req.json(); } catch { return j({ status: false, message: "bad_json" }, 400); }
  const ppId = String(p?.pp_id ?? "");
  if (!/^[0-9]{3,20}$/.test(ppId)) return j({ status: false, message: "bad_pp_id" }, 400);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: o } = await admin.from("payment_orders").select("*").eq("pp_id", ppId).maybeSingle();
  if (!o) return j({ status: true, message: "Webhook received" }); // not ours
  if (o.status === "paid") return j({ status: true, message: "Webhook received" });

  const r = await fetch(BASE + "/api/verify-payments", {
    method: "POST",
    headers: { "accept": "application/json", "content-type": "application/json", "mh-piprapay-api-key": KEY },
    body: JSON.stringify({ pp_id: ppId }),
  });
  let v: any = null;
  try { v = await r.json(); } catch { /* ignore */ }
  if (v?.status === "completed" && Number(v?.amount ?? v?.total) >= Number(o.amount_bdt) - 0.01) {
    await admin.rpc("piprapay_mark_paid", { p_order: o.id, p_pp_id: ppId, p_txn: String(v.transaction_id ?? ""), p_method: String(v.payment_method ?? "PipraPay") });
  }
  return j({ status: true, message: "Webhook received" });
});
