import { createClient } from "jsr:@supabase/supabase-js@2";

// Public customer endpoint (deploy with --no-verify-jwt).
// GET ?t=TOKEN[&d=DEVICE_ID] -> activates the DNS IP of the customer automatically, using the public IPv4 this request comes from.
// d = the phone's own ID, sent only by the mobile app. With it the account is locked to ONE PHONE (Wi-Fi/data can change freely).
// Without it (website) the old rules apply, but a phone-bound account refuses web activation.
// Auth = the same private 64-hex token the customer page uses. Rules live in dns_activate_ip.
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

const V4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
function clientIpv4(req: Request): string | null {
  const cands = [
    req.headers.get("cf-connecting-ip") ?? "",
    ...(req.headers.get("x-forwarded-for") ?? "").split(",").map((s) => s.trim()),
    req.headers.get("x-real-ip") ?? "",
  ];
  for (const c of cands) if (V4.test(c)) return c;
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  const u = new URL(req.url);
  const t = (u.searchParams.get("t") ?? "").trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(t)) return json({ ok: false, error: "not_found" }, 404);
  const dRaw = (u.searchParams.get("d") ?? "").trim();
  let device: string | null = /^[A-Za-z0-9_-]{8,64}$/.test(dRaw) ? dRaw : null;
  // wd = the browser's own random ID (website). It is used only when the admin switches app_settings.web_device_lock = 'on'.
  const wdRaw = (u.searchParams.get("wd") ?? "").trim();

  const ip = clientIpv4(req);
  if (!ip) return json({ ok: false, error: "ipv6" });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  if (!device && /^[A-Za-z0-9_-]{8,60}$/.test(wdRaw)) {
    try {
      const { data: s } = await admin.from("app_settings").select("value").eq("key", "web_device_lock").maybeSingle();
      if (s?.value === "on") device = "w" + wdRaw;
    } catch (_e) { /* setting unreadable: keep the old behaviour */ }
  }
  const ua = (req.headers.get("user-agent") ?? "").slice(0, 300);
  // Country / city for the admin screen: full country name from the header if present, otherwise one quick IP lookup (max 1.5 s).
  const cc = (req.headers.get("cf-ipcountry") ?? "").trim().slice(0, 2).toUpperCase();
  let country: string | null = null;
  if (/^[A-Z]{2}$/.test(cc)) {
    try { country = new Intl.DisplayNames(["en"], { type: "region" }).of(cc) ?? cc; } catch (_e) { country = cc; }
  }
  if (!country) {
    try {
      const r = await fetch(`https://ipwho.is/${ip}?fields=success,country,city`, { signal: AbortSignal.timeout(1500) });
      const g = await r.json();
      if (g?.success && g.country) country = (g.city ? `${g.country}, ${g.city}` : String(g.country)).slice(0, 80);
    } catch (_e) { /* no lookup: leave empty */ }
  }

  // If the customer has WireGuard switched on, this IP is the VPN server, shared by all VPN customers. Never bind that.
  try {
    const { data: cfg } = await admin.from("wg_config").select("api_url").eq("id", 1).maybeSingle();
    const wgHost = cfg?.api_url ? new URL(cfg.api_url).hostname : "";
    if (wgHost && wgHost === ip) return json({ ok: false, error: "vpn_on" });
  } catch (_e) { /* ignore */ }

  const { data, error } = await admin.rpc("dns_activate_ip", { p_token: t, p_ip: ip, p_device: device, p_ua: ua, p_country: country });
  if (error) return json({ ok: false, error: "server_error" }, 500);
  return json(data);
});
