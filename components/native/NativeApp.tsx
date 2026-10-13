'use client';
// MaheHub native app (Android + iOS via Capacitor). Customer-facing: login by link/ID, account, setup, plans, support.
// Used only when the site is built with NEXT_PUBLIC_APP_MODE=native (see app/page.tsx). The website build is unchanged.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { AppLauncher } from '@capacitor/app-launcher';
import { Clipboard } from '@capacitor/clipboard';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { Share } from '@capacitor/share';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Headphones, LogOut, MessageCircle, RefreshCw, Settings, Tag, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cleanPhone, parsePlans } from '../Storefront';
import QrModal from '../QrModal';

const FN = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ssaqdsqopxclkplstpzj.supabase.co') + '/functions/v1';
const BASE = FN + '/dns-portal';
const WG = FN + '/dns-wg';
const ACT = FN + '/dns-activate';
const SITE = 'https://smartdns.mahehub.com';
const TOKEN_KEY = 'mh_token';
const QR_THEME = { '--card': '#141c38', '--line': '#232c52', '--ink': '#eef1ff', '--mut': '#97a0c8', '--soft': '#1b2547' } as React.CSSProperties;

type Info = {
  found: boolean; valid?: boolean; status?: string; blocked?: boolean; phone_hint?: string; code?: string;
  expiry_date?: string; days_left?: number; bound_ip?: string | null; hostname?: string; activate_url?: string;
};
type Auto = '' | 'busy' | 'ok' | 'locked' | 'ipv6' | 'vpn_on' | 'expired' | 'error';
type Tab = 'account' | 'setup' | 'plans' | 'support';

const card = 'rounded-2xl border border-[#232c52] bg-[#141c38] p-5 mb-4';
const btn = 'inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition active:scale-95 disabled:opacity-60';
const primary = `${btn} bg-gradient-to-r from-indigo-500 to-violet-500 text-white`;
const ghost = `${btn} border border-[#232c52] bg-[#1b2547] text-white`;
const inp = 'w-full rounded-xl border border-[#232c52] bg-[#0c1226] px-3.5 py-3 text-sm text-[#eef1ff] outline-none focus:border-indigo-400';

export function tokenFromText(v: string): string {
  const s = (v || '').trim();
  if (!s) return '';
  try { const t = new URL(s).searchParams.get('t'); if (t) return t; } catch { /* not a URL */ }
  const m = s.match(/[?&]t=([^&\s]+)/);
  if (m) return decodeURIComponent(m[1]);
  return /^[A-Za-z0-9_-]{8,}$/.test(s) ? s : '';
}

async function openExternal(url: string) {
  try { await AppLauncher.openUrl({ url }); } catch { window.open(url, '_blank'); }
}
async function tap() { try { await Haptics.impact({ style: ImpactStyle.Light }); } catch { /* not supported */ } }

export default function NativeApp() {
  const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
  const isIos = platform === 'ios';
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState('');
  const [info, setInfo] = useState<Info | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('account');
  const [site, setSite] = useState<Record<string, string>>({});
  const [notices, setNotices] = useState<{ id: string; kind: string; title: string; body: string }[]>([]);
  const [auto, setAuto] = useState<Auto>('');
  const [toast, setToast] = useState('');
  const [qr, setQr] = useState('');
  const [wgBusy, setWgBusy] = useState('');
  const [wgMsg, setWgMsg] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const say = useCallback((m: string) => {
    setToast(m);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  }, []);

  const saveToken = useCallback(async (t: string) => {
    setToken(t);
    try { await Preferences.set({ key: TOKEN_KEY, value: t }); } catch { /* ignore */ }
  }, []);

  const logout = useCallback(async () => {
    setToken(''); setInfo(null); setAuto(''); setTab('account');
    try { await Preferences.remove({ key: TOKEN_KEY }); } catch { /* ignore */ }
  }, []);

  // Boot: status bar, saved login, link that opened the app, splash
  useEffect(() => {
    let off = false;
    let sub: { remove: () => void } | null = null;
    (async () => {
      try { await StatusBar.setStyle({ style: Style.Dark }); await StatusBar.setBackgroundColor({ color: '#0c1226' }); } catch { /* iOS or web */ }
      let t = '';
      try { t = (await Preferences.get({ key: TOKEN_KEY })).value || ''; } catch { /* ignore */ }
      try { const l = await CapApp.getLaunchUrl(); const lt = tokenFromText(l?.url || ''); if (lt) t = lt; } catch { /* ignore */ }
      if (off) return;
      if (t) await saveToken(t);
      setReady(true);
      try { await SplashScreen.hide(); } catch { /* ignore */ }
      try {
        sub = await CapApp.addListener('appUrlOpen', (e) => { const nt = tokenFromText(e.url || ''); if (nt) { saveToken(nt); setTab('account'); } });
      } catch { /* ignore */ }
    })();
    supabase.rpc('public_site_settings').then(({ data }) => { if (data) setSite(data as Record<string, string>); });
    supabase.rpc('active_announcements').then(({ data }) => { if (Array.isArray(data)) setNotices(data as any); });
    return () => { off = true; sub?.remove(); };
  }, [saveToken]);

  const loadInfo = useCallback(async (t: string) => {
    setLoading(true);
    try {
      const r = await fetch(`${BASE}?t=${encodeURIComponent(t)}`, { cache: 'no-store' });
      setInfo(r.ok ? await r.json() : { found: false });
    } catch { setInfo({ found: false }); }
    setLoading(false);
  }, []);

  const activate = useCallback(async (t: string) => {
    setAuto('busy');
    try {
      const r = await fetch(`${ACT}?t=${encodeURIComponent(t)}`, { cache: 'no-store' });
      const d = await r.json().catch(() => ({ ok: false, error: 'error' }));
      if (d?.ok) { setAuto('ok'); setInfo((i) => (i ? { ...i, bound_ip: d.ip || i.bound_ip } : i)); }
      else setAuto(d?.error === 'locked' ? 'locked' : d?.error === 'ipv6' ? 'ipv6' : d?.error === 'vpn_on' ? 'vpn_on' : d?.error === 'expired' ? 'expired' : 'error');
    } catch { setAuto('error'); }
  }, []);

  useEffect(() => { if (token) loadInfo(token); }, [token, loadInfo]);
  // activate this phone's network automatically once the account is known to be valid
  useEffect(() => {
    if (token && info?.found && info.valid && !info.blocked) activate(token);
  }, [token, info?.found, info?.valid, info?.blocked, activate]);

  // Re-check when the app comes back to the foreground (network may have changed)
  useEffect(() => {
    let sub: { remove: () => void } | null = null;
    CapApp.addListener('appStateChange', (s) => { if (s.isActive && token) { loadInfo(token); } }).then((h) => { sub = h; }).catch(() => {});
    return () => { sub?.remove(); };
  }, [token, loadInfo]);

  const copy = async (text: string, msg = 'Copied') => {
    try { await Clipboard.write({ string: text }); say(msg); } catch { say('Could not copy'); }
  };

  async function wgConf(): Promise<string | null> {
    setWgMsg('');
    try {
      const r = await fetch(`${WG}?t=${encodeURIComponent(token)}`, { cache: 'no-store' });
      if (!r.ok) {
        let code = ''; try { code = (await r.json())?.error || ''; } catch { /* not JSON */ }
        setWgMsg(code === 'device_locked' ? 'This WireGuard config is locked because it was used on 2 or more devices. Please contact support to unlock it.'
          : r.status === 403 ? 'Your subscription is not active.'
          : r.status === 404 ? 'Account not found. Please log in again.'
          : 'WireGuard is not ready right now. Please try again later or contact support.');
        return null;
      }
      return await r.text();
    } catch { setWgMsg('Could not connect. Please check your internet and try again.'); return null; }
  }
  function wgFileName() {
    const hint = String(info?.phone_hint || '').replace(/[^0-9A-Za-z]/g, '').slice(0, 6);
    return `mh${hint}-${Math.random().toString(36).slice(2, 5)}`.slice(0, 15);
  }
  async function wgShare() {
    setWgBusy('share'); const t = await wgConf(); setWgBusy('');
    if (!t) return;
    const name = wgFileName();
    try {
      const f = await Filesystem.writeFile({ path: `${name}.conf`, data: t, directory: Directory.Cache, encoding: Encoding.UTF8 });
      await Share.share({ title: 'MaheHub WireGuard', dialogTitle: 'Open with WireGuard', url: f.uri });
      setWgMsg(`Choose WireGuard in the list. If it is not listed, open WireGuard → + → Import from file → ${name}.conf, or use the QR code.`);
    } catch (e: any) {
      if (!/cancel/i.test(String(e?.message || ''))) setWgMsg('Could not share the file. Use "Show QR code" instead.');
    }
  }
  async function wgQr() { setWgBusy('qr'); const t = await wgConf(); setWgBusy(''); if (t) setQr(t); }

  const waBd = site.support_whatsapp_bd || '8801614082537';
  const waMy = site.support_whatsapp_my || '60173103546';
  const supportEmail = site.support_email || 'b2b@mahehub.com';
  const fbUrl = site.facebook_url || 'https://www.facebook.com/share/1DQkYhY8hY/?mibextid=wwXIfr';
  const tgUrl = site.telegram_url || 'https://t.me/+5v_WpMb2pjwwNDFl';
  const plans = parsePlans(site.store_plans);
  // Apple only allows selling digital services through in-app purchase, so the plans/order screen is Android-only.
  const tabs: [Tab, string, React.ReactNode][] = [
    ['account', 'Account', <User key="a" className="h-5 w-5" />],
    ['setup', 'Setup', <Settings key="s" className="h-5 w-5" />],
    ...(!isIos ? ([['plans', 'Plans', <Tag key="p" className="h-5 w-5" />]] as [Tab, string, React.ReactNode][]) : []),
    ['support', 'Support', <Headphones key="h" className="h-5 w-5" />],
  ];

  if (!ready) return <div className="grid h-[100dvh] place-items-center bg-[#0c1226]" />;
  if (!token) return <Welcome onToken={saveToken} />;

  const wrap = 'flex h-[100dvh] flex-col bg-[#0c1226] text-[#eef1ff]';
  return (
    <div className={wrap}>
      <header className="flex items-center justify-between px-4 pb-3" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}>
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 font-black text-white">M</div>
          <div><div className="text-sm font-black leading-none">MAHEHUB</div><div className="text-[10px] font-bold tracking-widest text-indigo-400">DNS SERVICE</div></div>
        </div>
        <button aria-label="Refresh" className="rounded-xl p-2 text-[#97a0c8] active:scale-90" onClick={() => { tap(); loadInfo(token); }}><RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /></button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="mx-auto w-full max-w-md">
          {notices.slice(0, 2).map((n) => (
            <div key={n.id} className={`mb-3 rounded-2xl border px-4 py-3 text-sm ${n.kind === 'offer' ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'}`}>
              <div className="font-black">{n.kind === 'offer' ? '🎁 ' : '📢 '}{n.title}</div>
              {n.body && <div className="mt-0.5 whitespace-pre-line text-xs opacity-90">{n.body}</div>}
            </div>
          ))}

          {tab === 'account' && (
            <>
              {loading && !info && <div className={card}>Loading…</div>}
              {info && !info.found && (
                <div className={card}>
                  <div className="mb-1 font-black">Account not found</div>
                  <p className="mb-3 text-sm text-[#97a0c8]">This link is invalid or has been replaced. Please log in again with your new link.</p>
                  <button className={primary} onClick={logout}>Log in again</button>
                </div>
              )}
              {info?.found && (
                <>
                  <div className={card}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-[#97a0c8]">Account •••• {info.phone_hint}</div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${info.valid ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>{info.blocked ? 'blocked' : info.status}</span>
                    </div>
                    <div className="mt-3 text-3xl font-black">{info.valid ? `${info.days_left} days left` : 'Not active'}</div>
                    <div className="mt-1 text-sm text-[#97a0c8]">Expires: <b className="text-[#eef1ff]">{info.expiry_date}</b></div>
                  </div>

                  {info.code && (
                    <button type="button" onClick={() => copy(info.code!, 'Customer ID copied')} className={`${card} block w-full text-center`}>
                      <div className="text-xs text-[#97a0c8]">Your customer ID · tap to copy</div>
                      <div className="my-1 font-mono text-3xl font-black tracking-[0.25em] text-emerald-400">{info.code}</div>
                      <p className="text-xs text-[#97a0c8]">{info.valid ? 'Send this ID to support on WhatsApp when you want to renew.' : 'Send this ID to support on WhatsApp to activate your subscription.'}</p>
                    </button>
                  )}

                  {info.valid ? (
                    <div className={card}>
                      <div className="mb-1 font-black">Network activation</div>
                      {auto === 'busy' && <p className="text-sm text-[#97a0c8]">Activating your network…</p>}
                      {auto === 'ok' && <p className="text-sm text-emerald-400">✓ Active{info.bound_ip ? ` for ${info.bound_ip}` : ''}. If you change Wi-Fi or mobile data, tap the button below.</p>}
                      {auto === 'vpn_on' && <p className="text-sm text-amber-400">WireGuard is on. Turn WireGuard off, then tap activate again.</p>}
                      {auto === 'locked' && <p className="text-sm text-amber-400">This account is locked to another network or device. Please contact support to unlock it.</p>}
                      {auto === 'expired' && <p className="text-sm text-amber-400">Your subscription is not active. Please renew.</p>}
                      {(auto === 'ipv6' || auto === 'error') && <p className="text-sm text-amber-400">Automatic activation did not work on this network. Try again on another Wi-Fi or mobile data.</p>}
                      <button className={`${ghost} mt-3`} disabled={auto === 'busy'} onClick={() => { tap(); activate(token); }}>Activate this network</button>
                    </div>
                  ) : (
                    <div className={card}><p className="text-sm text-[#97a0c8]">{info.blocked ? 'Your access is blocked. Please contact support.' : 'Your subscription is not active. Please renew with support.'}</p></div>
                  )}
                </>
              )}
              <button className="mt-2 flex w-full items-center justify-center gap-2 py-3 text-sm text-[#97a0c8]" onClick={logout}><LogOut className="h-4 w-4" />Log out</button>
              <button className="w-full py-2 text-xs text-[#97a0c8]" onClick={() => openExternal(`${SITE}/reseller/`)}>Are you a reseller? Open reseller panel</button>
            </>
          )}

          {tab === 'setup' && (
            info?.found && info.valid ? (
              <>
                {isIos ? (
                  <div className={card}>
                    <div className="mb-1 font-black">1. Install DNS profile</div>
                    <p className="mb-3 text-sm text-[#97a0c8]">Tap the button. Safari opens and downloads the profile. Then go to Settings → “Profile Downloaded” → Install.</p>
                    <button className={primary} onClick={() => openExternal(`${BASE}?t=${encodeURIComponent(token)}&download=profile`)}>Download profile</button>
                  </div>
                ) : (
                  <div className={card}>
                    <div className="mb-1 font-black">1. Private DNS</div>
                    <p className="mb-3 text-sm text-[#97a0c8]">Copy the hostname, then go to Settings → Network &amp; internet → Private DNS → “Private DNS provider hostname”, paste it and save.</p>
                    <button className={primary} onClick={() => copy(info.hostname || '', 'Hostname copied')}>Copy DNS hostname</button>
                    <div className="mt-2 break-all text-center text-xs text-[#97a0c8]">{info.hostname}</div>
                  </div>
                )}
                <div className={card}>
                  <div className="mb-1 font-black">2. Activate your network</div>
                  <p className="mb-3 text-sm text-[#97a0c8]">Go to the Account tab and tap “Activate this network” while you are on the Wi-Fi or mobile data you will use.</p>
                  <button className={ghost} onClick={() => setTab('account')}>Go to Account</button>
                </div>
                <div className={card}>
                  <div className="mb-1 font-black">3. WireGuard (full VPN, optional)</div>
                  <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-[#97a0c8]">
                    <li>Install the <b>WireGuard</b> app from the {isIos ? 'App Store' : 'Play Store'}.</li>
                    <li>Tap <b>Send to WireGuard</b>, choose WireGuard in the list, then Allow and switch the tunnel on.</li>
                    <li>Or tap <b>Show QR code</b> on another phone/computer and scan it from WireGuard (+ → Scan from QR code).</li>
                  </ol>
                  <p className="mb-3 text-xs text-[#97a0c8]">Keep this config private. It works on one phone only.</p>
                  <div className="space-y-2">
                    <button className={primary} disabled={!!wgBusy} onClick={wgShare}>{wgBusy === 'share' ? 'Please wait…' : 'Send to WireGuard'}</button>
                    <button className={ghost} disabled={!!wgBusy} onClick={wgQr}>{wgBusy === 'qr' ? 'Please wait…' : 'Show QR code'}</button>
                  </div>
                  {wgMsg && <div className="mt-3 text-center text-xs text-amber-400">{wgMsg}</div>}
                </div>
              </>
            ) : <div className={card}><p className="text-sm text-[#97a0c8]">Setup is available once your subscription is active.</p></div>
          )}

          {tab === 'plans' && !isIos && (
            <>
              <div className="mb-3 text-lg font-black">Plans</div>
              {plans.map((p) => (
                <div key={p.label} className={`${card} ${p.hot ? '!border-indigo-400' : ''}`}>
                  <div className="flex items-baseline justify-between"><div className="font-black">{p.label}</div><div className="text-2xl font-black">{p.price}</div></div>
                  {p.note && <div className="mt-1 text-xs text-[#97a0c8]">{p.note}</div>}
                  <button className={`${p.hot ? primary : ghost} mt-3`} onClick={() => openExternal(`https://wa.me/${waBd}?text=${encodeURIComponent(`Hello, I want the ${p.label} plan (${p.price}).${info?.code ? ` My customer ID: ${info.code}` : ''}`)}`)}>
                    <MessageCircle className="h-4 w-4" />Order on WhatsApp
                  </button>
                </div>
              ))}
              <p className="text-center text-xs text-[#97a0c8]">Pay by bKash or Nagad. Your account is activated after payment.</p>
            </>
          )}

          {tab === 'support' && (
            <>
              <div className="mb-3 text-lg font-black">Support</div>
              <div className={card}>
                <p className="mb-3 text-sm text-[#97a0c8]">Real people answer in Bangla and English.</p>
                <div className="space-y-2">
                  <button className={primary} onClick={() => openExternal(`https://wa.me/${waBd}?text=${encodeURIComponent(`Hello MaheHub Support.${info?.code ? ` My customer ID: ${info.code}` : ''}`)}`)}>🇧🇩 WhatsApp Bangladesh</button>
                  <button className={ghost} onClick={() => openExternal(`https://wa.me/${waMy}?text=${encodeURIComponent(`Hello MaheHub Support.${info?.code ? ` My customer ID: ${info.code}` : ''}`)}`)}>🇲🇾 WhatsApp Malaysia</button>
                  <button className={ghost} onClick={() => openExternal(tgUrl)}>Telegram</button>
                  <button className={ghost} onClick={() => openExternal(fbUrl)}>Facebook</button>
                  <button className={ghost} onClick={() => openExternal(`mailto:${supportEmail}`)}>Email</button>
                </div>
              </div>
              <div className="flex justify-center gap-4 text-xs text-[#97a0c8]">
                <button onClick={() => openExternal(`${SITE}/`)}>Website</button>
              </div>
            </>
          )}
        </div>
      </main>

      <nav className="border-t border-[#232c52] bg-[#0f1630]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto flex max-w-md">
          {tabs.map(([id, label, icon]) => (
            <button key={id} onClick={() => { tap(); setTab(id); }} className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold ${tab === id ? 'text-indigo-400' : 'text-[#97a0c8]'}`}>
              {icon}{label}
            </button>
          ))}
        </div>
      </nav>

      {toast && <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 mx-auto w-fit rounded-full bg-black/80 px-4 py-2 text-xs font-bold text-white">{toast}</div>}
      {qr && <QrModal title={info?.phone_hint ? `•••• ${info.phone_hint}` : 'WireGuard'} text={qr} onClose={() => setQr('')} style={QR_THEME} />}
    </div>
  );
}

function Welcome({ onToken }: { onToken: (t: string) => void }) {
  const [mode, setMode] = useState<'link' | 'new'>('link');
  const [link, setLink] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function paste() {
    try { const { value } = await Clipboard.read(); if (value) setLink(value); } catch { /* ignore */ }
  }
  function login() {
    const t = tokenFromText(link);
    if (!t) return setErr('Paste the full link your seller sent you.');
    onToken(t);
  }
  async function trial() {
    setErr('');
    const ph = cleanPhone(phone);
    if (name.trim().length < 2) return setErr('Please enter your name');
    if (!/^[1-9][0-9]{7,14}$/.test(ph)) return setErr('Enter country code and number together, without +. Example: 966501234567, 8801712345678, 60123456789');
    setBusy(true);
    const { data, error } = await supabase.rpc('public_free_trial', { p_name: name.trim(), p_phone: ph });
    setBusy(false);
    if (error || !data?.token) return setErr(error?.message || 'Could not create the trial. Please try again.');
    onToken(data.token);
  }

  return (
    <div className="flex h-[100dvh] flex-col justify-center overflow-y-auto bg-[#0c1226] px-5 text-[#eef1ff]" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-3xl font-black text-white">M</div>
          <div className="text-xl font-black">MaheHub</div>
          <p className="mt-1 text-sm text-[#97a0c8]">Smart DNS for Bangladeshi apps from abroad</p>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-[#1b2547] p-1 text-xs font-black">
          <button onClick={() => { setMode('link'); setErr(''); }} className={`rounded-lg py-2 ${mode === 'link' ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white' : 'text-[#97a0c8]'}`}>I have my link</button>
          <button onClick={() => { setMode('new'); setErr(''); }} className={`rounded-lg py-2 ${mode === 'new' ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white' : 'text-[#97a0c8]'}`}>Free trial</button>
        </div>
        <div className="space-y-3">
          {mode === 'link' ? (
            <>
              <input className={inp} placeholder="Paste your link here" value={link} onChange={(e) => setLink(e.target.value)} autoCapitalize="off" autoCorrect="off" />
              <button className={ghost} onClick={paste}>Paste from clipboard</button>
              {err && <div className="text-xs font-semibold text-rose-400">{err}</div>}
              <button className={primary} onClick={login}>Log in</button>
              <p className="text-center text-xs text-[#97a0c8]">Tip: if your seller sent you the link on WhatsApp, just tap it and this app opens.</p>
            </>
          ) : (
            <>
              <input className={inp} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              <input className={inp} inputMode="tel" placeholder="WhatsApp number with country code, no +" value={phone} onChange={(e) => setPhone(e.target.value)} />
              {err && <div className="text-xs font-semibold text-rose-400">{err}</div>}
              <button className={primary} disabled={busy} onClick={trial}>{busy ? 'Please wait…' : 'Start free trial'}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
