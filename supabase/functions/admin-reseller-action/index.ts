import { createClient } from "jsr:@supabase/supabase-js@2";

// Admin only (deploy WITH verify_jwt = true).
// POST { reseller_id, action: 'suspend' | 'ban' | 'activate' | 'delete' }
// suspend/ban  -> profiles.status + auth ban (reseller is signed out and cannot log in again)
// activate     -> lifts the ban
// delete       -> removes the login + profile, only if the reseller owns no customers (otherwise use Ban)
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: u } = await admin.auth.getUser(jwt);
  if (!u?.user) return json({ ok: false, error: "unauthorized" }, 401);
  const { data: me } = await admin.from("profiles").select("role").eq("id", u.user.id).maybeSingle();
  if (me?.role !== "admin") return json({ ok: false, error: "forbidden" }, 403);

  let body: any;
  try { body = await req.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }
  const id = String(body?.reseller_id ?? "");
  const action = String(body?.action ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ ok: false, error: "bad_id" }, 400);
  if (!["suspend", "ban", "activate", "delete"].includes(action)) return json({ ok: false, error: "bad_action" }, 400);
  if (id === u.user.id) return json({ ok: false, error: "cannot_act_on_self" }, 400);

  const { data: t } = await admin.from("profiles").select("id,role,name").eq("id", id).maybeSingle();
  if (!t) return json({ ok: false, error: "not_found" }, 404);
  if (t.role === "admin") return json({ ok: false, error: "cannot_act_on_admin" }, 400);

  const log = (m: string) => admin.from("activity_log").insert({ owner_id: u.user.id, message: m }).then(() => {}, () => {});

  if (action === "delete") {
    const { count } = await admin.from("vpn_accounts").select("id", { count: "exact", head: true }).eq("owner_id", id);
    if ((count ?? 0) > 0) return json({ ok: false, error: "has_customers", customers: count }, 409);
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return json({ ok: false, error: "delete_failed", detail: error.message }, 409);
    await log(`Admin deleted reseller ${t.name ?? id}`);
    return json({ ok: true });
  }

  const status = action === "activate" ? "active" : action === "ban" ? "banned" : "suspended";
  const { error: e1 } = await admin.auth.admin.updateUserById(id, {
    ban_duration: status === "active" ? "none" : "876000h",
  });
  if (e1) return json({ ok: false, error: "auth_failed", detail: e1.message }, 500);
  const { error: e2 } = await admin.from("profiles").update({ status }).eq("id", id);
  if (e2) return json({ ok: false, error: "profile_failed", detail: e2.message }, 500);
  await log(`Admin set reseller ${t.name ?? id} to ${status}`);
  return json({ ok: true, status });
});
