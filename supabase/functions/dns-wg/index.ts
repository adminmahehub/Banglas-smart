import { createClient } from "jsr:@supabase/supabase-js@2";

// Public customer endpoint (deploy with --no-verify-jwt).
// Auth = the same private 64-hex token the customer page already uses (?t=, only its hash is stored).
// GET ?t=TOKEN -> the customer's WireGuard .conf as plain text. Active customers only.
// It is a separate function on purpose, so the working dns-portal function is not touched.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

async function sha256hex(s: string): Promise<string> {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  const t = (new URL(req.url).searchParams.get("t") ?? "").trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(t)) return json({ found: false }, 404);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // same validity rule as the customer page: active, not expired, not blocked
  const { data: st, error: e1 } = await admin.rpc("dns_portal_get", { p_token: t });
  if (e1) return json({ error: "server_error" }, 500);
  if (!st?.found) return json({ found: false }, 404);
  if (!st.valid) return json({ error: "not_active" }, 403);

  const { data: da } = await admin.from("dns_access").select("account_id").eq("token_hash", await sha256hex(t)).maybeSingle();
  if (!da) return json({ found: false }, 404);
  const { data: acc } = await admin.from("vpn_accounts").select("username,cert_name").eq("id", da.account_id).maybeSingle();
  if (!acc) return json({ found: false }, 404);

  const { data: cfg } = await admin.from("wg_config").select("api_url,api_token").eq("id", 1).maybeSingle();
  if (!cfg) return json({ error: "wg_not_ready" }, 503);

  const name = acc.cert_name ?? String(acc.username).replace(/\./g, "_");
  try {
    const r = await fetch(`${cfg.api_url}/create`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.api_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!r.ok) return json({ error: "wg_server_error" }, 502);
    return new Response(await r.text(), {
      headers: { ...cors, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (_e) {
    return json({ error: "wg_unreachable" }, 502);
  }
});
