import { createClient } from "jsr:@supabase/supabase-js@2";

// Public endpoint for the mobile app (deploy with --no-verify-jwt).
// POST { phone, code, device } -> { ok:true, token } | { ok:false, error }
//   phone  = customer phone (digits, country code), code = the 6-digit customer ID, device = the phone's own ID.
// Rate limits + checks live in the dns_login SQL function. A successful login issues a NEW private token
// (the old link stops working) and binds the account to this phone.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

function clientIp(req: Request): string {
  const c = [
    req.headers.get("cf-connecting-ip") ?? "",
    ...(req.headers.get("x-forwarded-for") ?? "").split(",").map((s) => s.trim()),
    req.headers.get("x-real-ip") ?? "",
  ].find((x) => x);
  return (c ?? "").slice(0, 64);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  let body: any = {};
  try { body = await req.json(); } catch { return json({ ok: false, error: "invalid" }, 400); }
  const phone = String(body?.phone ?? "").slice(0, 32);
  const code = String(body?.code ?? "").slice(0, 16);
  const dRaw = String(body?.device ?? "").trim();
  const device = /^[A-Za-z0-9_-]{8,64}$/.test(dRaw) ? dRaw : "";
  if (!device) return json({ ok: false, error: "invalid" }, 400);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data, error } = await admin.rpc("dns_login", { p_phone: phone, p_code: code, p_device: device, p_ip: clientIp(req) });
  if (error) return json({ ok: false, error: "server_error" }, 500);
  return json(data);
});
