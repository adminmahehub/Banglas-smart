'use client';
// MaheHub native app (Android + iOS via Capacitor). Used only when built with NEXT_PUBLIC_APP_MODE=native (see app/page.tsx).
// Tabs: Home (everything from the website storefront) · Account (customer login + status) · Setup · Reseller (full reseller panel) · More.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { Share } from '@capacitor/share';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import {
  Briefcase, CheckCircle2, ChevronDown, Globe, Headphones, Home, LogOut, MessageCircle, Moon, MoreHorizontal,
  RefreshCw, Settings, ShieldCheck, Sparkles, Sun, User, Zap,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { copyText, openLink } from '../../lib/nativeBridge';
import { cleanPhone, parsePlans } from '../Storefront';
import QrModal from '../QrModal';
import ResellerPanel from '../ResellerPanel';

const FN = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ssaqdsqopxclkplstpzj.supabase.co') + '/functions/v1';
const BASE = FN + '/dns-portal';
const WG = FN + '/dns-wg';
const ACT = FN + '/dns-activate';
const SITE = 'https://smartdns.mahehub.com';
const TOKEN_KEY = 'mh_token';
const THEME_KEY = 'mh_theme';

type Theme = 'light' | 'dark';
type Info = {
  found: boolean; valid?: boolean; status?: string; blocked?: boolean; phone_hint?: string; code?: string;
  expiry_date?: string; days_left?: number; bound_ip?: string | null; hostname?: string; activate_url?: string;
};
type Auto = '' | 'busy' | 'ok' | 'locked' | 'ipv6' | 'vpn_on' | 'expired' | 'error';
type Tab = 'home' | 'account' | 'setup' | 'reseller' | 'more';

const THEMES: Record<Theme, Record<string, string>> = {
  light: { '--bg': '#f3f5fc', '--card': '#ffffff', '--line': '#e4e8f5', '--ink': '#161c3a', '--mut': '#6f7798', '--soft': '#edf0fb', '--glass': 'rgba(255,255,255,0.82)', '--shadow': '0 10px 30px rgba(70,84,160,0.10)' },
  dark: { '--bg': '#080d1c', '--card': '#121a33', '--line': '#212b50', '--ink': '#eef1ff', '--mut': '#97a0c8', '--soft': '#19244a', '--glass': 'rgba(12,18,38,0.82)', '--shadow': '0 10px 30px rgba(0,0,0,0.45)' },
};

const BRANDS = ['bKash', 'Nagad', 'Rocket', 'Upay', 'Alaap', 'Brilliant', 'WhatsApp Calling'];
const STEPS = [
  { t: 'Start your free trial', d: 'Enter your name and WhatsApp number. Your personal link is ready in seconds.' },
  { t: 'Install the DNS setting', d: 'Follow the short steps for iPhone or Android. It takes about two minutes.' },
  { t: 'Use your apps as usual', d: 'Open bKash, Nagad or WhatsApp. They see a connection from Bangladesh.' },
];
const WHY = [
  { t: 'No VPN app', d: 'A small DNS setting on your phone. Nothing running in the background, no battery drain.' },
  { t: 'One account, one network', d: 'Your account is locked to your own network, so a shared login cannot be passed around.' },
  { t: 'Servers in Dhaka', d: 'Bank and wallet requests are answered from Bangladesh.' },
  { t: 'Help on WhatsApp', d: 'Real people answer in Bangla and English from Bangladesh and Malaysia.' },
];
const FAQ: [string, string][] = [
  ['Do I need a VPN app?', 'No. You install a DNS setting once. On iPhone you install a profile. On Android the Setup tab shows the exact steps.'],
  ['Which apps does it work with?', 'bKash, Nagad, Rocket, Upay, Alaap, Brilliant and WhatsApp calling.'],
  ['Can I use one account on two phones?', 'Each account is locked to one network. If you move to a new Wi-Fi or country, ask your seller to unlock it.'],
  ['How do I pay?', 'Choose a rate and tap Order on WhatsApp. You pay by bKash or Nagad, and your account is activated after payment.'],
  ['Is there a free trial?', 'Yes. Create a customer account and try it before you pay.'],
];
const LEGAL: [string, string][] = [
  ['Terms of Service', 'Standard B2B Reseller License.'],
  ['Privacy Policy', 'Strict zero-log telemetry on user DNS traffic.'],
  ['Refund Policy', 'Unused wallet balance is 100% refundable within 24h.'],
  ['Service SLA', '99.98% guaranteed uptime for enterprise proxies.'],
];

const CSS = `
@keyframes mhIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes mhShimmer{0%{background-position:-200px 0}100%{background-position:200px 0}}
.mh-in>*{animation:mhIn .38s cubic-bezier(.2,.8,.2,1) both}
.mh-in>*:nth-child(2){animation-delay:.04s}.mh-in>*:nth-child(3){animation-delay:.08s}.mh-in>*:nth-child(4){animation-delay:.12s}
.mh-in>*:nth-child(5){animation-delay:.16s}.mh-in>*:nth-child(6){animation-delay:.2s}.mh-in>*:nth-child(n+7){animation-delay:.24s}
.mh-skel{background:linear-gradient(90deg,var(--soft) 0,var(--line) 50%,var(--soft) 100%);background-size:400px 100%;animation:mhShimmer 1.2s infinite linear}
.mh-press{transition:transform .15s ease}.mh-press:active{transform:scale(.97)}
.mh-scroll{-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
`;

const card = 'rounded-3xl border border-[var(--line)] bg-[var(--card)] p-5 mb-4 shadow-[var(--shadow)]';
const btn = 'mh-press inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-bold disabled:opacity-60';
const primary = `${btn} bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30`;
const ghost = `${btn} border border-[var(--line)] bg-[var(--soft)] text-[var(--ink)]`;
const inp = 'w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3.5 text-sm text-[var(--ink)] outline-none focus:border-indigo-400';

export function tokenFromText(v: string): string {
  const s = (v || '').trim();
  if (!s) return '';
  try { const t = new URL(s).searchParams.get('t'); if (t) return t; } catch { /* not a URL */ }
  const m = s.match(/[?&]t=([^&\s]+)/);
  if (m) return decodeURIComponent(m[1]);
  return /^[A-Za-z0-9_-]{8,}$/.test(s) ? s : '';
}
async function tap() { try { await Haptics.impact({ style: ImpactStyle.Light }); } catch { /* not supported */ } }

export default function NativeApp() {
  const isIos = Capacitor.getPlatform() === 'ios';
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [token, setToken] = useState('');
  const [info, setInfo] = useState<Info | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('home');
  const [site, setSite] = useState<Record<string, string>>({});
  const [notices, setNotices] = useState<{ id: string; kind: string; title: string; body: string }[]>([]);
  const [auto, setAuto] = useState<Auto>('');
  const [toast, setToast] = useState('');
  const [qr, setQr] = useState('');
  const [wgBusy, setWgBusy] = useState('');
  const [wgMsg, setWgMsg] = useState('');
  const [faqOpen, setFaqOpen] = useState(-1);
  const [legalOpen, setLegalOpen] = useState(-1);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);

  const say = useCallback((m: string) => {
    setToast(m);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  }, []);

  const applyBars = useCallback(async (t: Theme) => {
    try { await StatusBar.setStyle({ style: t === 'dark' ? Style.Dark : Style.Light }); await StatusBar.setBackgroundColor({ color: THEMES[t]['--bg'] }); } catch { /* iOS or web */ }
  }, []);
  const changeTheme = useCallback(async (t: Theme) => {
    setTheme(t); applyBars(t);
    try { await Preferences.set({ key: THEME_KEY, value: t }); } catch { /* ignore */ }
  }, [applyBars]);

  const saveToken = useCallback(async (t: string) => {
    setToken(t);
    try { await Preferences.set({ key: TOKEN_KEY, value: t }); } catch { /* ignore */ }
  }, []);
  const logout = useCallback(async () => {
    setToken(''); setInfo(null); setAuto(''); setTab('home');
    try { await Preferences.remove({ key: TOKEN_KEY }); } catch { /* ignore */ }
  }, []);
  const go = useCallback((t: Tab) => { tap(); setTab(t); mainRef.current?.scrollTo({ top: 0 }); }, []);

  // Boot: saved theme + login, link that opened the app, splash
  useEffect(() => {
    let off = false;
    let sub: { remove: () => void } | null = null;
    (async () => {
      let th: Theme = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      try { const v = (await Preferences.get({ key: THEME_KEY })).value; if (v === 'light' || v === 'dark') th = v; } catch { /* ignore */ }
      setTheme(th); applyBars(th);
      let t = '';
      try { t = (await Preferences.get({ key: TOKEN_KEY })).value || ''; } catch { /* ignore */ }
      try { const l = await CapApp.getLaunchUrl(); const lt = tokenFromText(l?.url || ''); if (lt) { t = lt; setTab('account'); } } catch { /* ignore */ }
      if (off) return;
      if (t) await saveToken(t);
      setReady(true);
      try { await SplashScreen.hide(); } catch { /* ignore */ }
      try { sub = await CapApp.addListener('appUrlOpen', (e) => { const nt = tokenFromText(e.url || ''); if (nt) { saveToken(nt); setTab('account'); } }); } catch { /* ignore */ }
    })();
    supabase.rpc('public_site_settings').then(({ data }) => { if (data) setSite(data as Record<string, string>); });
    supabase.rpc('active_announcements').then(({ data }) => { if (Array.isArray(data)) setNotices(data as any); });
    return () => { off = true; sub?.remove(); };
  }, [saveToken, applyBars]);

  // Android back button: go to Home first, then exit
  useEffect(() => {
    let sub: { remove: () => void } | null = null;
    CapApp.addListener('backButton', () => { if (tab !== 'home') setTab('home'); else CapApp.exitApp(); }).then((h) => { sub = h; }).catch(() => {});
    return () => { sub?.remove(); };
  }, [tab]);

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
  useEffect(() => { if (token && info?.found && info.valid && !info.blocked) activate(token); }, [token, info?.found, info?.valid, info?.blocked, activate]);
  useEffect(() => {
    let sub: { remove: () => void } | null = null;
    CapApp.addListener('appStateChange', (s) => { if (s.isActive && token) loadInfo(token); }).then((h) => { sub = h; }).catch(() => {});
    return () => { sub?.remove(); };
  }, [token, loadInfo]);

  const copy = async (text: string, msg = 'Copied') => { await copyText(text); say(msg); };

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
  const ttUrl = 'https://www.tiktok.com/@maheinternationaltravels?_r=1&_t=ZS-9ABtGvkGcBJ';
  const ytUrl = 'https://youtube.com/@mdhemayetuddin-officialbd?si=rXjpWheCiAKcOWH-';
  const plans = parsePlans(site.store_plans);
  const idTxt = info?.code ? ` My customer ID: ${info.code}` : '';
  const wa = (num: string, text: string) => openLink(`https://wa.me/${num}?text=${encodeURIComponent(text)}`);

  const vars = THEMES[theme] as React.CSSProperties;
  if (!ready) return <div style={vars} className="h-[100dvh] bg-[var(--bg)]" />;

  const tabs: [Tab, string, React.ReactNode][] = [
    ['home', 'Home', <Home key="h" className="h-[22px] w-[22px]" />],
    ['account', 'Account', <User key="a" className="h-[22px] w-[22px]" />],
    ['setup', 'Setup', <Settings key="s" className="h-[22px] w-[22px]" />],
    ['reseller', 'Reseller', <Briefcase key="r" className="h-[22px] w-[22px]" />],
    ['more', 'More', <MoreHorizontal key="m" className="h-[22px] w-[22px]" />],
  ];
  const logged = !!token;
  const active = !!(info?.found && info.valid && !info.blocked);

  // ---------- pieces ----------
  const AutoNote = () => (
    <>
      {auto === 'busy' && <p className="text-sm text-[var(--mut)]">Activating your network…</p>}
      {auto === 'ok' && <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-500"><CheckCircle2 className="h-4 w-4" />Active{info?.bound_ip ? ` for ${info.bound_ip}` : ''}. Changed Wi-Fi or mobile data? Tap activate again.</p>}
      {auto === 'vpn_on' && <p className="text-sm text-amber-500">WireGuard is on. Turn WireGuard off, then tap activate again.</p>}
      {auto === 'locked' && <p className="text-sm text-amber-500">This account is locked to another network or device. Please contact support to unlock it.</p>}
      {auto === 'expired' && <p className="text-sm text-amber-500">Your subscription is not active. Please renew.</p>}
      {(auto === 'ipv6' || auto === 'error') && <p className="text-sm text-amber-500">Automatic activation did not work on this network. Try again on another Wi-Fi or mobile data.</p>}
    </>
  );

  const HomeTab = (
    <div className="mh-in">
      <div className="relative mb-4 overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl shadow-indigo-500/30">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl" />
        {logged && info?.found ? (
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white/80">Welcome back •••• {info.phone_hint}</div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold backdrop-blur">{info.blocked ? 'blocked' : info.status}</span>
            </div>
            <div className="mt-3 text-4xl font-black leading-none">{info.valid ? info.days_left : 0}<span className="ml-2 text-lg font-bold text-white/80">days left</span></div>
            <div className="mt-1 text-xs text-white/75">Expires {info.expiry_date}</div>
            <button className="mh-press mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-black text-indigo-700 disabled:opacity-70" disabled={!active || auto === 'busy'} onClick={() => { tap(); activate(token); }}>
              <Zap className="h-4 w-4" />{auto === 'busy' ? 'Activating…' : 'Activate this network'}
            </button>
            {auto === 'ok' && <div className="mt-2 text-center text-xs font-semibold text-white/90">✓ Active</div>}
          </div>
        ) : (
          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold backdrop-blur"><Sparkles className="h-3.5 w-3.5" />Smart DNS · Made for Bangladeshis abroad</div>
            <h1 className="text-[26px] font-black leading-tight">{site.store_headline || 'Use bKash, Nagad and WhatsApp calling from abroad'}</h1>
            <p className="mt-2 text-sm text-white/80">{site.store_subline || 'No VPN app. Made for Bangladeshis in Saudi Arabia, Malaysia and the Gulf.'}</p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button className="mh-press rounded-2xl bg-white px-3 py-3.5 text-sm font-black text-indigo-700" onClick={() => go('account')}>Start free trial</button>
              <button className="mh-press rounded-2xl border border-white/40 bg-white/10 px-3 py-3.5 text-sm font-bold backdrop-blur" onClick={() => go('account')}>I have my link</button>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4 grid grid-cols-4 gap-2.5">
        {([
          ['Setup', <Settings key="1" className="h-5 w-5" />, () => go('setup')],
          ['Support', <Headphones key="2" className="h-5 w-5" />, () => wa(waBd, `Hello MaheHub Support.${idTxt}`)],
          ['Account', <User key="3" className="h-5 w-5" />, () => go('account')],
          ['Reseller', <Briefcase key="4" className="h-5 w-5" />, () => go('reseller')],
        ] as [string, React.ReactNode, () => void][]).map(([l, ic, fn]) => (
          <button key={l} onClick={() => { tap(); fn(); }} className="mh-press flex flex-col items-center gap-1.5 rounded-2xl border border-[var(--line)] bg-[var(--card)] py-3.5 text-[11px] font-bold shadow-[var(--shadow)]">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--soft)] text-indigo-500">{ic}</span>{l}
          </button>
        ))}
      </div>

      {notices.slice(0, 2).map((n) => (
        <div key={n.id} className={`mb-3 rounded-2xl border px-4 py-3 text-sm ${n.kind === 'offer' ? 'border-amber-500/40 bg-amber-500/10 text-amber-600' : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-600'}`}>
          <div className="font-black">{n.kind === 'offer' ? '🎁 ' : '📢 '}{n.title}</div>
          {n.body && <div className="mt-0.5 whitespace-pre-line text-xs opacity-90">{n.body}</div>}
        </div>
      ))}

      <div className={card}>
        <div className="mb-3 text-sm font-black">Works with</div>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((b) => <span key={b} className="inline-flex items-center gap-1 rounded-full bg-[var(--soft)] px-3 py-1.5 text-xs font-bold"><span className="text-emerald-500">✓</span>{b}</span>)}
        </div>
      </div>

      {!isIos && (
        <>
          <div className="mb-2 mt-2 px-1 text-lg font-black">Expat package rates</div>
          {plans.map((p) => (
            <div key={p.label} className={`${card} ${p.hot ? '!border-indigo-400 ring-2 ring-indigo-400/30' : ''}`}>
              <div className="flex items-start justify-between">
                <div><div className="font-black">{p.label}</div>{p.note && <div className="mt-0.5 text-xs text-[var(--mut)]">{p.note}</div>}</div>
                <div className="text-right"><div className="text-2xl font-black">{p.price}</div>{p.hot && <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-black text-white">POPULAR</span>}</div>
              </div>
              <button className={`${p.hot ? primary : ghost} mt-3`} onClick={() => wa(waBd, `Hello, I want the ${p.label} plan (${p.price}).${idTxt}`)}><MessageCircle className="h-4 w-4" />Order on WhatsApp</button>
            </div>
          ))}
          <p className="mb-4 text-center text-xs text-[var(--mut)]">Pay by bKash or Nagad. Your account is activated after payment.</p>
        </>
      )}

      <div className="mb-2 mt-2 px-1 text-lg font-black">How it works</div>
      <div className={card}>
        {STEPS.map((s, i) => (
          <div key={s.t} className={`flex gap-3 ${i ? 'mt-4' : ''}`}>
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-black text-white">{i + 1}</div>
            <div><div className="text-sm font-black">{s.t}</div><div className="mt-0.5 text-xs text-[var(--mut)]">{s.d}</div></div>
          </div>
        ))}
      </div>

      <div className="mb-2 px-1 text-lg font-black">Why MaheHub</div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        {WHY.map((w) => (
          <div key={w.t} className="rounded-3xl border border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
            <ShieldCheck className="mb-2 h-5 w-5 text-indigo-500" />
            <div className="text-sm font-black">{w.t}</div><div className="mt-1 text-[11px] leading-snug text-[var(--mut)]">{w.d}</div>
          </div>
        ))}
      </div>

      <div className="mb-2 px-1 text-lg font-black">Questions</div>
      <div className={`${card} !p-2`}>
        {FAQ.map(([q, a], i) => (
          <div key={q} className={i ? 'border-t border-[var(--line)]' : ''}>
            <button className="flex w-full items-center justify-between gap-3 px-3 py-3.5 text-left text-sm font-bold" onClick={() => { tap(); setFaqOpen(faqOpen === i ? -1 : i); }}>
              {q}<ChevronDown className={`h-4 w-4 shrink-0 text-[var(--mut)] transition-transform ${faqOpen === i ? 'rotate-180' : ''}`} />
            </button>
            {faqOpen === i && <p className="px-3 pb-4 text-xs leading-relaxed text-[var(--mut)]">{a}</p>}
          </div>
        ))}
      </div>
    </div>
  );

  const LoginForm = <LoginCard onToken={saveToken} />;

  const AccountTab = (
    <div className="mh-in">
      {!logged && LoginForm}
      {logged && loading && !info && (<><div className="mh-skel mb-4 h-32 rounded-3xl" /><div className="mh-skel mb-4 h-24 rounded-3xl" /></>)}
      {logged && info && !info.found && (
        <div className={card}>
          <div className="mb-1 font-black">Account not found</div>
          <p className="mb-3 text-sm text-[var(--mut)]">This link is invalid or has been replaced. Please log in again with your new link.</p>
          <button className={primary} onClick={logout}>Log in again</button>
        </div>
      )}
      {logged && info?.found && (
        <>
          <div className={card}>
            <div className="flex items-center justify-between">
              <div className="text-sm text-[var(--mut)]">Account •••• {info.phone_hint}</div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${info.valid ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'}`}>{info.blocked ? 'blocked' : info.status}</span>
            </div>
            <div className="mt-3 text-3xl font-black">{info.valid ? `${info.days_left} days left` : 'Not active'}</div>
            <div className="mt-1 text-sm text-[var(--mut)]">Expires: <b className="text-[var(--ink)]">{info.expiry_date}</b></div>
          </div>
          {info.code && (
            <button type="button" onClick={() => copy(info.code!, 'Customer ID copied')} className={`${card} mh-press block w-full text-center`}>
              <div className="text-xs text-[var(--mut)]">Your customer ID · tap to copy</div>
              <div className="my-1 font-mono text-3xl font-black tracking-[0.25em] text-emerald-500">{info.code}</div>
              <p className="text-xs text-[var(--mut)]">{info.valid ? 'Send this ID to support on WhatsApp when you want to renew.' : 'Send this ID to support on WhatsApp to activate your subscription.'}</p>
            </button>
          )}
          {info.valid ? (
            <div className={card}>
              <div className="mb-2 font-black">Network activation</div>
              <AutoNote />
              <button className={`${ghost} mt-3`} disabled={auto === 'busy'} onClick={() => { tap(); activate(token); }}>Activate this network</button>
            </div>
          ) : (
            <div className={card}><p className="text-sm text-[var(--mut)]">{info.blocked ? 'Your access is blocked. Please contact support.' : 'Your subscription is not active. Please renew with support.'}</p>
              <button className={`${primary} mt-3`} onClick={() => wa(waBd, `Hello, I want to renew.${idTxt}`)}><MessageCircle className="h-4 w-4" />Renew on WhatsApp</button></div>
          )}
          <button className="flex w-full items-center justify-center gap-2 py-3 text-sm text-[var(--mut)]" onClick={logout}><LogOut className="h-4 w-4" />Log out</button>
        </>
      )}
    </div>
  );

  const SetupTab = (
    <div className="mh-in">
      {logged && info?.found && info.valid ? (
        <>
          {isIos ? (
            <div className={card}>
              <div className="mb-1 font-black">1. Install DNS profile</div>
              <p className="mb-3 text-sm text-[var(--mut)]">Tap the button. Safari opens and downloads the profile. Then go to Settings → “Profile Downloaded” → Install.</p>
              <button className={primary} onClick={() => openLink(`${BASE}?t=${encodeURIComponent(token)}&download=profile`)}>Download profile</button>
            </div>
          ) : (
            <div className={card}>
              <div className="mb-1 font-black">1. Private DNS</div>
              <p className="mb-3 text-sm text-[var(--mut)]">Copy the hostname, then go to Settings → Network &amp; internet → Private DNS → “Private DNS provider hostname”, paste it and save.</p>
              <button className={primary} onClick={() => copy(info.hostname || '', 'Hostname copied')}>Copy DNS hostname</button>
              <div className="mt-2 break-all text-center text-xs text-[var(--mut)]">{info.hostname}</div>
            </div>
          )}
          <div className={card}>
            <div className="mb-1 font-black">2. Activate your network</div>
            <p className="mb-3 text-sm text-[var(--mut)]">Tap activate while you are on the Wi-Fi or mobile data you will use.</p>
            <AutoNote />
            <button className={`${ghost} mt-3`} disabled={auto === 'busy'} onClick={() => { tap(); activate(token); }}>Activate this network</button>
          </div>
          <div className={card}>
            <div className="mb-1 font-black">3. WireGuard (full VPN, optional)</div>
            <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-[var(--mut)]">
              <li>Install the <b>WireGuard</b> app from the {isIos ? 'App Store' : 'Play Store'}.</li>
              <li>Tap <b>Send to WireGuard</b>, choose WireGuard in the list, then Allow and switch the tunnel on.</li>
              <li>Or tap <b>Show QR code</b> on another phone/computer and scan it from WireGuard (+ → Scan from QR code).</li>
            </ol>
            <p className="mb-3 text-xs text-[var(--mut)]">Keep this config private. It works on one phone only.</p>
            <div className="space-y-2">
              <button className={primary} disabled={!!wgBusy} onClick={wgShare}>{wgBusy === 'share' ? 'Please wait…' : 'Send to WireGuard'}</button>
              <button className={ghost} disabled={!!wgBusy} onClick={wgQr}>{wgBusy === 'qr' ? 'Please wait…' : 'Show QR code'}</button>
            </div>
            {wgMsg && <div className="mt-3 text-center text-xs text-amber-500">{wgMsg}</div>}
          </div>
        </>
      ) : (
        <div className={card}>
          <div className="mb-1 font-black">{logged ? 'Subscription not active' : 'Log in first'}</div>
          <p className="mb-3 text-sm text-[var(--mut)]">{logged ? 'Setup is available once your subscription is active.' : 'Log in with your link or start a free trial to see your setup steps.'}</p>
          <button className={primary} onClick={() => go('account')}>Go to Account</button>
        </div>
      )}
    </div>
  );

  const MoreTab = (
    <div className="mh-in">
      <div className={card}>
        <div className="mb-3 text-sm font-black">Appearance</div>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[var(--soft)] p-1 text-sm font-bold">
          {(['light', 'dark'] as Theme[]).map((t) => (
            <button key={t} onClick={() => { tap(); changeTheme(t); }} className={`mh-press flex items-center justify-center gap-2 rounded-xl py-3 ${theme === t ? 'bg-[var(--card)] text-indigo-500 shadow' : 'text-[var(--mut)]'}`}>
              {t === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}{t === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
      </div>
      <div className={card}>
        <div className="mb-1 text-sm font-black">Support</div>
        <p className="mb-3 text-xs text-[var(--mut)]">Real people answer in Bangla and English.</p>
        <div className="space-y-2">
          <button className={primary} onClick={() => wa(waBd, `Hello MaheHub BD Support.${idTxt}`)}>🇧🇩 WhatsApp Bangladesh +{waBd}</button>
          <button className={ghost} onClick={() => wa(waMy, `Hello MaheHub Malaysia Support.${idTxt}`)}>🇲🇾 WhatsApp Malaysia +{waMy}</button>
          <div className="grid grid-cols-2 gap-2">
            <button className={ghost} onClick={() => openLink(tgUrl)}>Telegram</button>
            <button className={ghost} onClick={() => openLink(fbUrl)}>Facebook</button>
            <button className={ghost} onClick={() => openLink(ttUrl)}>TikTok</button>
            <button className={ghost} onClick={() => openLink(ytUrl)}>YouTube</button>
          </div>
          <button className={ghost} onClick={() => openLink(`mailto:${supportEmail}`)}>B2B / API · {supportEmail}</button>
        </div>
      </div>
      <div className={`${card} !p-2`}>
        {LEGAL.map(([t, d], i) => (
          <div key={t} className={i ? 'border-t border-[var(--line)]' : ''}>
            <button className="flex w-full items-center justify-between px-3 py-3.5 text-left text-sm font-bold" onClick={() => { tap(); setLegalOpen(legalOpen === i ? -1 : i); }}>
              {t}<ChevronDown className={`h-4 w-4 text-[var(--mut)] transition-transform ${legalOpen === i ? 'rotate-180' : ''}`} />
            </button>
            {legalOpen === i && <p className="px-3 pb-4 text-xs text-[var(--mut)]">{d}</p>}
          </div>
        ))}
      </div>
      <button className={`${ghost} mb-3`} onClick={() => openLink(SITE)}><Globe className="h-4 w-4" />Open website</button>
      {logged && <button className="flex w-full items-center justify-center gap-2 py-3 text-sm text-[var(--mut)]" onClick={logout}><LogOut className="h-4 w-4" />Log out of customer account</button>}
      <p className="pb-2 text-center text-[11px] text-[var(--mut)]">MaheHub · {isIos ? 'iOS' : 'Android'} app</p>
    </div>
  );

  const titles: Record<Tab, string> = { home: 'MaheHub', account: 'Account', setup: 'Setup', reseller: 'Reseller', more: 'More' };

  return (
    <div style={vars} className="flex h-[100dvh] flex-col bg-[var(--bg)] text-[var(--ink)]">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header className="flex items-center justify-between px-5 pb-2" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 10px)' }}>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-black text-white shadow-lg shadow-indigo-500/30">M</div>
          <div>
            <div className="text-lg font-black leading-none">{titles[tab]}</div>
            {tab === 'home' && <div className="mt-0.5 text-[10px] font-bold tracking-[0.2em] text-indigo-500">SMART DNS</div>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {logged && <button aria-label="Refresh" className="mh-press rounded-xl p-2.5 text-[var(--mut)]" onClick={() => { tap(); loadInfo(token); }}><RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /></button>}
          <button aria-label="Theme" className="mh-press rounded-xl p-2.5 text-[var(--mut)]" onClick={() => { tap(); changeTheme(theme === 'dark' ? 'light' : 'dark'); }}>{theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
        </div>
      </header>

      <main ref={mainRef} className="mh-scroll flex-1 overflow-y-auto px-4 pb-8 pt-2">
        <div className={`mx-auto w-full ${tab === 'reseller' ? 'max-w-3xl' : 'max-w-md'}`} key={tab}>
          {tab === 'home' && HomeTab}
          {tab === 'account' && AccountTab}
          {tab === 'setup' && SetupTab}
          {tab === 'more' && MoreTab}
          {tab === 'reseller' && <div className="-mx-4 -mt-2"><ResellerPanel initialDark={theme === 'dark'} onLogout={() => go('home')} onStorefront={() => go('home')} /></div>}
        </div>
      </main>

      <nav className="border-t border-[var(--line)] backdrop-blur-xl" style={{ background: 'var(--glass)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto flex max-w-md px-2 pt-1.5">
          {tabs.map(([id, label, icon]) => (
            <button key={id} onClick={() => go(id)} className="mh-press flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10.5px] font-bold">
              <span className={`grid h-8 w-14 place-items-center rounded-full transition-colors ${tab === id ? 'bg-indigo-500/15 text-indigo-500' : 'text-[var(--mut)]'}`}>{icon}</span>
              <span className={tab === id ? 'text-indigo-500' : 'text-[var(--mut)]'}>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {toast && <div className="pointer-events-none fixed inset-x-0 bottom-28 z-50 mx-auto w-fit rounded-full bg-black/85 px-4 py-2 text-xs font-bold text-white">{toast}</div>}
      {qr && <QrModal title={info?.phone_hint ? `•••• ${info.phone_hint}` : 'WireGuard'} text={qr} onClose={() => setQr('')} style={vars} />}
    </div>
  );
}

function LoginCard({ onToken }: { onToken: (t: string) => void }) {
  const [mode, setMode] = useState<'link' | 'new'>('new');
  const [link, setLink] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function paste() {
    try { const { Clipboard } = await import('@capacitor/clipboard'); const { value } = await Clipboard.read(); if (value) setLink(value); } catch { /* ignore */ }
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
    <div className={card}>
      <div className="mb-1 text-xl font-black">Customer account</div>
      <p className="mb-4 text-xs text-[var(--mut)]">Start a free trial or log in with the link your seller sent you.</p>
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-[var(--soft)] p-1 text-xs font-black">
        <button onClick={() => { setMode('new'); setErr(''); }} className={`rounded-xl py-2.5 ${mode === 'new' ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow' : 'text-[var(--mut)]'}`}>Free trial</button>
        <button onClick={() => { setMode('link'); setErr(''); }} className={`rounded-xl py-2.5 ${mode === 'link' ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow' : 'text-[var(--mut)]'}`}>I have my link</button>
      </div>
      <div className="space-y-3">
        {mode === 'link' ? (
          <>
            <input className={inp} placeholder="Paste your link here" value={link} onChange={(e) => setLink(e.target.value)} autoCapitalize="off" autoCorrect="off" />
            <button className={ghost} onClick={paste}>Paste from clipboard</button>
            {err && <div className="text-xs font-semibold text-rose-500">{err}</div>}
            <button className={primary} onClick={login}>Log in</button>
            <p className="text-center text-xs text-[var(--mut)]">Tip: if your seller sent you the link on WhatsApp, just tap it and this app opens.</p>
          </>
        ) : (
          <>
            <input className={inp} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className={inp} inputMode="tel" placeholder="WhatsApp number with country code, no +" value={phone} onChange={(e) => setPhone(e.target.value)} />
            {err && <div className="text-xs font-semibold text-rose-500">{err}</div>}
            <button className={primary} disabled={busy} onClick={trial}>{busy ? 'Please wait…' : 'Start free trial'}</button>
          </>
        )}
      </div>
    </div>
  );
}
