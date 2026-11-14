import { createClient } from "jsr:@supabase/supabase-js@2";

// MaheHub White-label / B2B API (deploy with verify_jwt = false; it authenticates with the partner's API key).
// Header:  x-api-key: mh_live_...
// POST { action:'balance' }
// POST { action:'create_customer', phone:'8801XXXXXXXXX', months:1 }   -> uses partner credits (1 credit = 1 month)
// POST { action:'status', phone:'8801XXXXXXXXX' }
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-api-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });

async function sha256hex(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);
  const key = (req.headers.get("x-api-key") ?? "").trim();
  if (!/^mh_live_[0-9a-f]{48}$/.test(key)) return json({ ok: false, error: "invalid_api_key" }, 401);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: partner } = await admin.rpc("b2b_partner_by_key", { p_hash: await sha256hex(key) });
  if (!partner) return json({ ok: false, error: "invalid_api_key" }, 401);

  let body: any = {};
  try { body = await req.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }
  const action = String(body?.action ?? "");

  if (action === "balance") return json({ ok: true, partner: partner.name, credits: partner.credits });

  if (action === "status") {
    const { data } = await admin.rpc("b2b_customer_status", { p_partner: partner.id, p_phone: String(body?.phone ?? "") });
    return data ? json({ ok: true, customer: data }) : json({ ok: false, error: "not_found" }, 404);
  }

  if (action === "create_customer") {
    const { data, error } = await admin.rpc("b2b_create_customer", {
      p_partner: partner.id, p_phone: String(body?.phone ?? ""), p_months: Math.floor(Number(body?.months ?? 1)),
    });
    if (error) {
      const m = String(error.message || "");
      const known = ["invalid_phone", "invalid_months", "already_exists", "insufficient_credits"].find((k) => m.includes(k));
      return json({ ok: false, error: known ?? "failed" }, known === "insufficient_credits" ? 402 : known ? 400 : 500);
    }
    return json({
      ok: true,
      customer: {
        phone: data.phone, customer_id: data.customer_id, expiry: data.expiry,
        setup_link: `https://smartdns.mahehub.com/c/?t=${data.token}`,
      },
      credits_left: data.credits_left,
    });
  }
  return json({ ok: false, error: "bad_action" }, 400);
});
