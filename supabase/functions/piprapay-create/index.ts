import { createClient } from "jsr:@supabase/supabase-js@2";

// Reseller online top-up through PipraPay (deploy WITH verify_jwt = true).
// Secrets (Supabase > Edge Functions > Secrets): PIPRAPAY_API_KEY, PIPRAPAY_BASE_URL (e.g. https://pay.mahehub.com)
// POST { action:'create', credits, return_url } -> { ok:true, url }   (open `url` to pay)
// POST { action:'check', order }               -> { ok:true, status } (asks the gateway, adds credits once if paid)
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });

const BASE = (Deno.env.get("PIPRAPAY_BASE_URL") ?? "").replace(/\/+$/, "");
const KEY = Deno.env.get("PIPRAPAY_API_KEY") ?? "";
async function pp(path: string, body: unknown) {
  const r = await fetch(BASE + path, {
    method: "POST",
    headers: { "accept": "application/json", "content-type": "application/json", "mh-piprapay-api-key": KEY },
    body: JSON.stringify(body),
  });
  let j: any = null;
  try { j = await r.json(); } catch { /* not json */ }
  return { ok: r.ok, j };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);
  if (!BASE || !KEY) return json({ ok: false, error: "gateway_not_configured" }, 503);

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: u } = await admin.auth.getUser(jwt);
  if (!u?.user) return json({ ok: false, error: "unauthorized" }, 401);
  let body: any;
  try { body = await req.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }

  if (body?.action === "check") {
    const id = String(body?.order ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ ok: false, error: "bad_order" }, 400);
    const { data: o } = await admin.from("payment_orders").select("*").eq("id", id).maybeSingle();
    if (!o || o.owner_id !== u.user.id) return json({ ok: false, error: "not_found" }, 404);
    if (o.status === "paid") return json({ ok: true, status: "paid" });
    if (!o.pp_id) return json({ ok: true, status: o.status });
    const v = await pp("/api/verify-payments", { pp_id: String(o.pp_id) });
    if (v.j?.status === "completed" && Number(v.j?.amount ?? v.j?.total) >= Number(o.amount_bdt) - 0.01) {
      await admin.rpc("piprapay_mark_paid", { p_order: o.id, p_pp_id: String(o.pp_id), p_txn: String(v.j.transaction_id ?? ""), p_method: String(v.j.payment_method ?? "PipraPay") });
      return json({ ok: true, status: "paid" });
    }
    return json({ ok: true, status: "pending" });
  }

  // create
  const credits = Math.floor(Number(body?.credits));
  if (!credits || credits < 10 || credits > 100000) return json({ ok: false, error: "min_10_credits" }, 400);
  const { data: prof } = await admin.from("profiles").select("id,name,role,status").eq("id", u.user.id).maybeSingle();
  if (!prof || prof.status === "banned" || prof.status === "suspended") return json({ ok: false, error: "forbidden" }, 403);
  const kind = body?.kind === "vpn" ? "vpn" : "dns";
  const { data: st } = await admin.from("app_settings").select("value").eq("key", kind === "vpn" ? "vpn_price_per_credit" : "price_per_credit").maybeSingle();
  const price = Number(st?.value) || 200;
  const amount = Math.round(credits * price);

  const { data: order, error: oe } = await admin.from("payment_orders")
    .insert({ owner_id: u.user.id, credits, amount_bdt: amount, kind }).select("id").single();
  if (oe || !order) return json({ ok: false, error: "order_failed" }, 500);

  const ret = String(body?.return_url ?? "");
  const safeRet = /^https:\/\/smartdns\.mahehub\.com\//.test(ret) ? ret : "https://smartdns.mahehub.com/reseller/";
  const sep = safeRet.includes("?") ? "&" : "?";
  const c = await pp("/api/create-charge", {
    full_name: String(prof.name ?? "Reseller").slice(0, 60),
    email_mobile: u.user.email ?? "",
    amount: String(amount),
    metadata: { order_id: order.id, credits },
    redirect_url: `${safeRet}${sep}pay=${order.id}`,
    return_type: "GET",
    cancel_url: safeRet,
    webhook_url: `${url}/functions/v1/piprapay-webhook`,
    currency: "BDT",
  });
  if (!c.j?.status || !c.j?.pp_url) {
    await admin.from("payment_orders").update({ status: "failed" }).eq("id", order.id);
    return json({ ok: false, error: "gateway_error" }, 502);
  }
  await admin.from("payment_orders").update({ pp_id: String(c.j.pp_id) }).eq("id", order.id);
  return json({ ok: true, url: String(c.j.pp_url), order: order.id });
});
