import { createClient } from "jsr:@supabase/supabase-js@2";

// Deploy with --no-verify-jwt. The WireGuard server calls this every minute with its API token.
Deno.serve(async (req) => {
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: cfg } = await admin.from("wg_config").select("api_token").eq("id", 1).maybeSingle();
  if (!cfg || req.headers.get("Authorization") !== `Bearer ${cfg.api_token}`) {
    return new Response("unauthorized", { status: 401 });
  }
  const b = await req.json().catch(() => ({}));
  const { data, error } = await admin.rpc("wg_sync", { p_usage: b.usage ?? {} });
  if (error) return new Response(error.message, { status: 500 });
  return Response.json(data);
});
