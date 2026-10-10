import { createClient } from "jsr:@supabase/supabase-js@2";

// Logged-in resellers/admin: download a WireGuard profile (.conf) or remove a peer.
// Works for VPN accounts and for DNS (phone number) accounts: one credit gives both.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const bad = (m: string, s: number) => new Response(m, { status: s, headers: cors });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // RLS: a reseller only sees their own accounts
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return bad("Login required", 401);

  const { username, action } = await req.json();
  const { data: acc } = await sb.from("vpn_accounts").select("username,status,service,cert_name,expiry_date").eq("username", username).maybeSingle();
  if (!acc) return bad("Account not found", 404);
  if (acc.service !== "vpn" && acc.service !== "dns") return bad("This account cannot use WireGuard", 400);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: cfg } = await admin.from("wg_config").select("api_url,api_token").eq("id", 1).maybeSingle();
  if (!cfg) {
    if (action === "revoke") return new Response(JSON.stringify({ ok: true, skipped: true }), { headers: cors });
    return bad("The WireGuard server is not set up yet", 503);
  }

  const name = acc.cert_name ?? acc.username.replace(/\./g, "_");
  const call = (path: string) =>
    fetch(`${cfg.api_url}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.api_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

  try {
    if (action === "revoke") {
      const r = await call("/revoke");
      return new Response(await r.text(), { status: r.status, headers: cors });
    }
    const today = new Date().toISOString().slice(0, 10);
    if (acc.status !== "active" || (acc.expiry_date && String(acc.expiry_date) < today)) return bad("Account is not active", 403);
    const r = await call("/create");
    return new Response(await r.text(), {
      status: r.status,
      headers: { ...cors, "Content-Type": r.headers.get("Content-Type") ?? "text/plain" },
    });
  } catch (_e) {
    return bad("Could not reach the WireGuard server", 502);
  }
});
