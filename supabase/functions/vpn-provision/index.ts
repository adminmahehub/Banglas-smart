import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const bad = (m: string, s: number) => new Response(m, { status: s, headers: cors });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // identify the logged-in user; RLS means they can only see their own accounts
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return bad("Login required", 401);

  const { username, action } = await req.json();
  const { data: acc } = await sb.from("vpn_accounts").select("username,days,status,cert_name,cert_revoked").eq("username", username).maybeSingle();
  if (!acc) return bad("Account not found", 404);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: cfg } = await admin.from("vps_config").select("api_url,api_token").eq("id", 1).maybeSingle();
  if (!cfg) return bad("Server config missing", 500);

  const base = acc.username.replace(/\./g, "_");
  let cert = acc.cert_name ?? base;
  const call = (path: string, name: string) =>
    fetch(`${cfg.api_url}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.api_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name, days: acc.days }),
    });

  try {
    if (action === "revoke") {
      const r = await call("/revoke", cert);
      if (r.ok) await admin.from("vpn_accounts").update({ cert_revoked: true }).eq("username", acc.username);
      return new Response(await r.text(), { status: r.status, headers: cors });
    }
    // create / download
    if (acc.status !== "active") return bad("Account is not active", 403);
    if (acc.cert_revoked) {
      // the old certificate was revoked: issue a new one
      cert = `${base}_${Date.now().toString(36)}`;
      await admin.from("vpn_accounts").update({ cert_name: cert, cert_revoked: false }).eq("username", acc.username);
    }
    const r = await call("/create", cert);
    return new Response(await r.text(), {
      status: r.status,
      headers: { ...cors, "Content-Type": r.headers.get("Content-Type") ?? "text/plain" },
    });
  } catch (_e) {
    return bad("Could not reach the VPN server", 502);
  }
});
