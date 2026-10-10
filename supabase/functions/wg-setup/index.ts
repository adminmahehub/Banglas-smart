import { createClient } from "jsr:@supabase/supabase-js@2";

// Deploy with --no-verify-jwt. Serves the WireGuard server install script (setup code: 24h, max uses in the table).
Deno.serve(async (req) => {
  const code = new URL(req.url).searchParams.get("code") ?? "";
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: c } = await admin.from("vps_setup_codes").select("code,uses,expires_at").eq("code", code).maybeSingle();
  if (!c || new Date(c.expires_at) < new Date() || c.uses >= 5) return new Response("invalid or expired code\n", { status: 403 });
  const { data: cfg } = await admin.from("wg_config").select("api_token").eq("id", 1).maybeSingle();
  const { data: asset } = await admin.from("vps_assets").select("body").eq("name", "setup-wg-server.sh").maybeSingle();
  if (!cfg || !asset) return new Response("config missing\n", { status: 500 });
  await admin.from("vps_setup_codes").update({ uses: c.uses + 1 }).eq("code", code);
  const body = asset.body
    .replaceAll("__TOKEN__", cfg.api_token)
    .replaceAll("__SYNC_URL__", `${Deno.env.get("SUPABASE_URL")}/functions/v1/wg-sync`);
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
});
