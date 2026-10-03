import { createClient } from "jsr:@supabase/supabase-js@2";

// VPS har minute yahan usage bhejta hai aur revoke karne wali list wapas leta hai
Deno.serve(async (req) => {
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: cfg } = await admin.from("vps_config").select("api_token").eq("id", 1).maybeSingle();
  if (!cfg || req.headers.get("Authorization") !== `Bearer ${cfg.api_token}`) {
    return new Response("unauthorized", { status: 401 });
  }
  const b = await req.json().catch(() => ({}));
  const { data, error } = await admin.rpc("vpn_sync", { p_usage: b.usage ?? {}, p_revoked: b.revoked ?? [] });
  if (error) return new Response(error.message, { status: 500 });
  return Response.json({ revoke: data ?? [] });
});
