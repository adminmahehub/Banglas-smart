'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Users, Network, PlusCircle, Activity, KeyRound, UserCircle, LogOut, Search,
  Menu, X, Copy, Moon, Sun, Home, Trash2, RefreshCw, Ban, Download, UserPlus, Wallet, Server, Check, Link2, MessageCircle,
} from 'lucide-react';
import type { OpenVpnAccount } from '../lib/suauthData';
import { supabase } from '../lib/supabase';

type Tab = 'dashboard' | 'users' | 'resellers' | 'credit' | 'activity' | 'api' | 'profile';
const NAV: { id: Tab; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'resellers', label: 'Resellers', icon: Network },
  { id: 'credit', label: 'Add Credit', icon: PlusCircle },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'api', label: 'API', icon: KeyRound },
  { id: 'profile', label: 'User Profile', icon: UserCircle },
];
const LIGHT = { '--bg': '#f4f6fb', '--card': '#ffffff', '--ink': '#1b2140', '--mut': '#7b83a6', '--line': '#e6e9f4', '--soft': '#eef1fb' };
const DARK = { '--bg': '#0c1226', '--card': '#141c38', '--ink': '#eef1ff', '--mut': '#97a0c8', '--line': '#232c52', '--soft': '#1b2547' };
const PRICE: Record<string, Record<string, number>> = {
  Normal: { '10': 40, '30': 60, '200': 140, Unlimited: 180 },
  VIP: { '10': 70, '30': 120, '200': 300, Unlimited: 240 },
};
const PER_CREDIT = 200; // 10 credits = ৳2000
const HOST = { Normal: 'my.ovpn.ovh', VIP: 'vip.ovpn.ovh' } as const;
const card = 'rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-[0_8px_30px_rgba(60,72,140,0.07)]';
const inp = 'w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-indigo-400';
const btn = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition active:scale-95';
const primary = `${btn} bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:brightness-110`;
const ghost = `${btn} border border-[var(--line)] bg-[var(--card)] text-[var(--ink)] hover:bg-[var(--soft)]`;

function waNumber(p: string) { const d = String(p).replace(/\D/g, ''); return d.startsWith('0') ? '880' + d.slice(1) : d; }
function copy(t: string) { try { navigator.clipboard?.writeText(t); } catch { /* ignore */ } }
function fmtGb(a: OpenVpnAccount) {
  const used = a.usedMb >= 1024 ? `${(a.usedMb / 1024).toFixed(1)} GB` : `${a.usedMb} MB`;
  return a.bandwidthType === 'Unlimited' ? `${used} / ∞` : `${used} / ${a.bandwidthGb} GB`;
}
function pct(a: OpenVpnAccount) {
  return a.bandwidthType === 'Unlimited' ? 6 : Math.min(100, (a.usedMb / 1024 / Math.max(1, a.bandwidthGb)) * 100);
}
function profile(a: OpenVpnAccount) {
  const remotes = a.multiServerFailover.map((ip) => `remote ${ip} 1194`).join('\n');
  return `# DEMO PROFILE - real certificate/server details will be added after servers are connected\nclient\ndev tun\nproto udp\n${remotes}\nremote-random\nresolv-retry infinite\nnobind\npersist-key\npersist-tun\nverb 3\n# user: ${a.username}\n`;
}

export default function ResellerPanel({ onLogout, onStorefront }: { onLogout: () => void; onStorefront: () => void }) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [dark, setDark] = useState(false);
  const [menu, setMenu] = useState(false);
  const [accounts, setAccounts] = useState<OpenVpnAccount[]>([]);
  const [user, setUser] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [prof, setProf] = useState<any>(null);
  const [auth, setAuth] = useState({ email: '', password: '', name: '', whatsapp: '', signup: false });
  const [msg, setMsg] = useState('');
  const [creditTo, setCreditTo] = useState('');
  const [pName, setPName] = useState('');
  const [pWa, setPWa] = useState('');
  const credits = Number(prof?.credits ?? 0);
  const isAdmin = prof?.role === 'admin';
  const [q, setQ] = useState('');
  const [log, setLog] = useState<{ t: string; m: string }[]>([]);
  const [modal, setModal] = useState(false);
  const [slip, setSlip] = useState<OpenVpnAccount | null>(null);
  const [resellers, setResellers] = useState<any[]>([]);
  const [form, setForm] = useState({ phone: '', months: 1, bw: 'Unlimited' });
  const [renewFor, setRenewFor] = useState<OpenVpnAccount | null>(null);
  const [dnsLink, setDnsLink] = useState<{ username: string; url: string } | null>(null);
  const [renewMonths, setRenewMonths] = useState(1);
  const [renewGb, setRenewGb] = useState(0);
  const [coupon, setCoupon] = useState('');
  const [couponPct, setCouponPct] = useState(0);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newPct, setNewPct] = useState(10);
  const [err, setErr] = useState('');
  const [topup, setTopup] = useState<number>(0);
  const [copied, setCopied] = useState('');
  const toAcc = (r: any): OpenVpnAccount => ({
    id: r.id, username: r.username, password: r.password, server: r.server_tier === 'VIP' ? 'VIP Brilliant' : 'Normal Dhaka',
    serverHost: r.server_host, days: r.days, bandwidthType: r.bandwidth_type, bandwidthGb: r.bandwidth_gb, usedMb: Number(r.used_mb),
    totalPriceBdt: Number(r.price_bdt), startDate: r.start_date,
    expiryDate: new Date(r.expiry_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase(),
    status: r.status, importLink: `${window.location.origin}/?view=user_import&user=${encodeURIComponent(r.username)}`,
    multiServerFailover: ['103.145.118.24', '185.220.101.55', '45.148.12.80'],
  });
  const load = async () => {
    const [p, v, a] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('vpn_accounts').select('*').order('created_at', { ascending: false }),
      supabase.from('activity_log').select('message,created_at').order('created_at', { ascending: false }).limit(100),
    ]);
    const rows: any[] = p.data || [];
    const me = rows.find((x) => x.id === user?.id) || null;
    setProf(me); setPName(me?.name || ''); setPWa(me?.whatsapp || '');
    setResellers(me?.role === 'admin' ? rows.filter((x) => x.role === 'reseller') : []);
    setAccounts((v.data || []).map(toAcc));
    const cp = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons(cp.data || []);
    setLog((a.data || []).map((x: any) => ({ t: new Date(x.created_at).toLocaleString(), m: x.message })));
  };
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => setUser(sess?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => { if (user) load(); else { setProf(null); setAccounts([]); } }, [user]);

  const list = useMemo(() => accounts.filter((a) => a.username.toLowerCase().includes(q.toLowerCase())), [accounts, q]);
  const active = accounts.filter((a) => a.status === 'active').length;
  const flash = (k: string, t: string) => { copy(t); setCopied(k); setTimeout(() => setCopied(''), 1200); };

  async function doAuth() {
    setMsg('');
    if (auth.signup && auth.whatsapp.replace(/[^0-9]/g, '').length < 8) return setMsg('Enter your WhatsApp number with country code');
    const r = auth.signup
      ? await supabase.auth.signUp({ email: auth.email, password: auth.password, options: { data: { name: auth.name, whatsapp: auth.whatsapp } } })
      : await supabase.auth.signInWithPassword({ email: auth.email, password: auth.password });
    if (r.error) return setMsg(r.error.message);
    if (auth.signup && !r.data.session) setMsg('Account created. Check your email to confirm, then log in.');
  }
  async function create() {
    setErr('');
    const { data, error } = await supabase.rpc('create_customer', { p_phone: form.phone, p_months: form.months, p_bw: form.bw });
    if (error) return setErr(error.message);
    await load(); setModal(false); setSlip(toAcc(data)); setForm({ phone: '', months: 1, bw: 'Unlimited' });
  }
  async function makeLink(a: OpenVpnAccount) {
    if (!confirm('Create a new customer link for ' + a.username + '? If a link was sent before, it will stop working.')) return;
    const { data, error } = await supabase.rpc('generate_customer_link', { p_username: a.username });
    if (error || !data) { alert('Could not create the link: ' + (error?.message || 'unknown error')); return; }
    setDnsLink({ username: a.username, url: `${window.location.origin}/c/?t=${data}` });
  }
  async function dnsAction(kind: 'clear' | 'unblock', username: string) {
    const { error } = await supabase.rpc(kind === 'clear' ? 'dns_clear_ip' : 'dns_unblock', { p_username: username });
    alert(error ? error.message : (kind === 'clear' ? 'IP cleared. The customer must press Activate again.' : 'Customer unblocked.'));
  }
  async function renew() {
    if (!renewFor) return;
    const { error } = await supabase.rpc('renew_customer', { p_username: renewFor.username, p_months: renewMonths, p_add_gb: renewGb });
    if (error) { alert(error.message); return; }
    alert('Renewed successfully.'); setRenewFor(null); setRenewMonths(1); setRenewGb(0); load();
  }
  async function checkCoupon() {
    setCouponPct(0);
    if (!coupon.trim()) return;
    const { data } = await supabase.from('coupons').select('percent,active').ilike('code', coupon.trim()).maybeSingle();
    if (!data || !data.active) { alert('Invalid or inactive coupon.'); return; }
    setCouponPct(Number(data.percent));
  }
  async function saveCoupon() {
    const code = newCode.trim().toUpperCase();
    if (!code || newPct < 1 || newPct > 100) { alert('Enter a code and a percent from 1 to 100.'); return; }
    const { error } = await supabase.from('coupons').insert({ code, percent: newPct, active: true });
    if (error) { alert(error.message); return; }
    setNewCode(''); load();
  }
  async function delCoupon(code: string) {
    if (!confirm(`Delete coupon ${code}?`)) return;
    await supabase.from('coupons').delete().eq('code', code); load();
  }
  async function setStatus(id: string, status: OpenVpnAccount['status'], username: string) {
    const { data: upd, error } = await supabase.from('vpn_accounts').update({ status }).eq('id', id).select('id');
    if (error) { alert('Update failed: ' + error.message); return; }
    if (!upd || upd.length === 0) { alert('Nothing was changed. The database did not allow this update for your account (permission rule). Send this message to your developer.'); return; }
    // on suspend/expired, also revoke the certificate on the server (the server retries every minute if this fails)
    if (status !== 'active') {
      const rv = await supabase.functions.invoke('vpn-provision', { body: { username, action: 'revoke' } });
      if (rv.error) {
        let detail = rv.error.message;
        try { const ctx = (rv.error as any)?.context; if (ctx?.text) detail = `${ctx.status}: ${await ctx.text()}`; } catch {}
        alert('Status saved, but the server certificate could not be revoked yet (it will retry automatically). Details: ' + detail);
      }
    }
    load();
  }
  async function del(a: OpenVpnAccount) {
    if (!confirm(`Delete ${a.username}?`)) return;
    const rv = await supabase.functions.invoke('vpn-provision', { body: { username: a.username, action: 'revoke' } });
    if (rv.error) {
      let detail = rv.error.message;
      try { const ctx = (rv.error as any)?.context; if (ctx?.text) detail = `${ctx.status}: ${await ctx.text()}`; } catch {}
      alert('Could not revoke the certificate on the server, so the account was not deleted. Details: ' + detail); return;
    }
    const { data: gone, error } = await supabase.from('vpn_accounts').delete().eq('id', a.id).select('id');
    if (error) { alert('Delete failed: ' + error.message); return; }
    if (!gone || gone.length === 0) { alert('Nothing was deleted. The database did not allow this delete for your account (permission rule). Send this message to your developer.'); return; }
    load();
  }
  async function addCredit() {
    const n = Math.floor(Number(topup));
    if (!creditTo) { alert('Select an account first.'); return; }
    if (!n || n <= 0) { alert('Enter the number of credits (1 credit = 1 month).'); return; }
    const payable = Math.round(n * PER_CREDIT * (100 - couponPct) / 100);
    if (!confirm(`Add ${n} credits? Payable: ৳${payable}`)) return;
    const { error } = await supabase.rpc('admin_add_credits', { p_user: creditTo, p_credits: n, p_coupon: couponPct > 0 ? coupon.trim() : null });
    if (error) alert(error.message); else { alert(`Added ${n} credits. Payable was ৳${payable}`); setTopup(0); setCoupon(''); setCouponPct(0); load(); }
  }
  async function saveProfile() {
    const { error } = await supabase.from('profiles').update({ name: pName, whatsapp: pWa }).eq('id', user.id);
    if (error) alert(error.message); else { alert('Saved'); load(); }
  }

  const download = async (a: OpenVpnAccount) => {
    const { data, error } = await supabase.functions.invoke('vpn-provision', { body: { username: a.username } });
    if (error || !data) {
      let detail = error?.message || 'the server is not responding';
      try { const ctx = (error as any)?.context; if (ctx?.text) detail = `${ctx.status}: ${await ctx.text()}`; } catch {}
      alert('Could not create the profile: ' + detail); return;
    }
    const text = data instanceof Blob ? await data.text() : (typeof data === 'string' ? data : JSON.stringify(data));
    const blob = new Blob([text], { type: 'application/x-openvpn-profile' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url; el.download = `${a.username}.ovpn`; el.style.display = 'none';
    document.body.appendChild(el); el.click(); document.body.removeChild(el);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const Stat = ({ icon: I, label, value, tone }: { icon: any; label: string; value: string | number; tone: string }) => (
    <div className={`${card} p-5 flex items-center gap-4`}>
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white ${tone}`}><I className="h-5 w-5" /></div>
      <div><div className="text-xs font-semibold text-[var(--mut)]">{label}</div><div className="text-2xl font-black text-[var(--ink)]">{value}</div></div>
    </div>
  );
  const Head = ({ t, s, children }: { t: string; s?: string; children?: any }) => (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div><h2 className="text-xl font-black text-[var(--ink)]">{t}</h2>{s && <p className="text-sm text-[var(--mut)]">{s}</p>}</div>{children}
    </div>
  );

  const UsersTable = ({ rows, compact }: { rows: OpenVpnAccount[]; compact?: boolean }) => (
    <div className={`${card} overflow-hidden`}>
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm">
        <thead><tr className="text-left text-[11px] uppercase tracking-wider text-[var(--mut)] bg-[var(--soft)]">
          {['Phone number', 'Bandwidth', 'Start date', 'Expire date', 'Status', ...(compact ? [] : ['Actions'])].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}
        </tr></thead>
        <tbody>{rows.map((a) => (
          <tr key={a.id} className="border-t border-[var(--line)] text-[var(--ink)]">
            <td className="px-4 py-3"><div className="font-bold">{a.username}</div></td>
            <td className="px-4 py-3 text-xs font-semibold"><div className="h-1.5 w-24 rounded-full bg-[var(--line)] overflow-hidden mb-1"><div className="h-full rounded-full bg-violet-500" style={{ width: a.bandwidthType === 'Unlimited' ? '8%' : `${Math.min(100, (a.usedMb / (a.bandwidthGb * 1024)) * 100)}%` }} /></div>{(a.usedMb / 1024).toFixed(1)} GB / {a.bandwidthType === 'Unlimited' ? 'Unlimited' : `${a.bandwidthGb} GB`}</td>
            <td className="px-4 py-3 text-xs font-semibold">{a.startDate ? new Date(a.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
            <td className="px-4 py-3 text-xs font-semibold">{a.expiryDate}</td>
            <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${a.status === 'active' ? 'bg-emerald-500/15 text-emerald-600' : a.status === 'suspended' ? 'bg-amber-500/15 text-amber-600' : 'bg-rose-500/15 text-rose-500'}`}>{a.status}</span></td>
            {!compact && <td className="px-4 py-3"><div className="flex gap-1.5">
              <button title="Import link / slip" onClick={() => setSlip(a)} className={`${ghost} !p-2`}><Copy className="h-4 w-4" /></button>
              <button title="Download .ovpn" onClick={() => download(a)} className={`${ghost} !p-2`}><Download className="h-4 w-4" /></button>
              <button title="Customer link (DNS)" onClick={() => makeLink(a)} className={`${ghost} !p-2`}><Link2 className="h-4 w-4" /></button>
              <button title="Renew (choose months)" onClick={() => { setRenewFor(a); setRenewMonths(1); setRenewGb(0); }} className={`${ghost} !p-2`}><RefreshCw className="h-4 w-4" /></button>
              <button title="Suspend" onClick={() => setStatus(a.id, 'suspended', a.username)} className={`${ghost} !p-2`}><Ban className="h-4 w-4" /></button>
              <button title="Delete" onClick={() => del(a)} className={`${ghost} !p-2 text-rose-500`}><Trash2 className="h-4 w-4" /></button></div></td>}
          </tr>))}
          {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-[var(--mut)]">No users found</td></tr>}
        </tbody></table></div>
    </div>
  );

  const themeVars = (dark ? DARK : LIGHT) as any;
  if (!ready) return <div style={themeVars} className="min-h-screen grid place-items-center bg-[var(--bg)] text-[var(--mut)]">Loading…</div>;
  if (!user) return (
    <div style={themeVars} className="min-h-screen grid place-items-center bg-[var(--bg)] p-4 text-[var(--ink)]">
      <div className={`${card} w-full max-w-sm p-7`}>
        <div className="mb-5 flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white grid place-items-center font-black">M</div><div><div className="font-black">MAHEHUB</div><div className="text-[10px] font-bold text-indigo-500 tracking-widest">RESELLER LOGIN</div></div></div>
        {auth.signup && <input className={`${inp} mb-3`} placeholder="Name" value={auth.name} onChange={(e) => setAuth({ ...auth, name: e.target.value })} />}
        {auth.signup && <input className={`${inp} mb-3`} inputMode="tel" placeholder="WhatsApp number with country code" value={auth.whatsapp} onChange={(e) => setAuth({ ...auth, whatsapp: e.target.value })} />}
        <input className={`${inp} mb-3`} type="email" placeholder="Email" value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} />
        <input className={`${inp} mb-3`} type="password" placeholder="Password (min 6)" value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} />
        {msg && <div className="mb-3 text-sm font-semibold text-rose-500">{msg}</div>}
        <button className={`${primary} w-full`} onClick={doAuth}>{auth.signup ? 'Create account' : 'Login'}</button>
        <button className="mt-3 w-full text-sm font-semibold text-indigo-500" onClick={() => { setMsg(''); setAuth({ ...auth, signup: !auth.signup }); }}>{auth.signup ? 'Already have an account? Log in' : 'Create a new reseller account'}</button>
        <button className="mt-1 w-full text-xs text-[var(--mut)]" onClick={onStorefront}>← Storefront</button>
      </div>
    </div>
  );

  return (
    <div style={(dark ? DARK : LIGHT) as any} className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex">
      {menu && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMenu(false)} />}
      <aside className={`fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 bg-[var(--card)] border-r border-[var(--line)] p-5 flex flex-col transition-transform ${menu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white grid place-items-center font-black">M</div>
          <div className="leading-tight"><div className="font-black tracking-tight">MAHEHUB</div><div className="text-[10px] font-bold text-indigo-500 tracking-widest">VPN PANEL</div></div>
          <button className="ml-auto lg:hidden" onClick={() => setMenu(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="space-y-1 flex-1">{NAV.map(({ id, label, icon: I }) => (
          <button key={id} onClick={() => { setTab(id); setMenu(false); }}
            className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${tab === id ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25' : 'text-[var(--mut)] hover:bg-[var(--soft)] hover:text-[var(--ink)]'}`}>
            <I className="h-[18px] w-[18px]" />{label}</button>))}
        </nav>
        <button onClick={onStorefront} className={`${ghost} w-full mb-2`}><Home className="h-4 w-4" />Storefront</button>
        <button onClick={async () => { await supabase.auth.signOut(); onLogout(); }} className={`${btn} w-full text-rose-500 hover:bg-rose-500/10`}><LogOut className="h-4 w-4" />Logout</button>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--line)] bg-[var(--bg)]/90 px-4 sm:px-8 py-3 backdrop-blur">
          <button className="lg:hidden" onClick={() => setMenu(true)}><Menu className="h-6 w-6" /></button>
          <div className="text-sm text-[var(--mut)] hidden sm:block">MaheHub / <span className="font-bold text-[var(--ink)] capitalize">{tab}</span></div>
          <div className="ml-auto flex items-center gap-2">
            <div className={`${ghost} !py-1.5 cursor-default`}><Wallet className="h-4 w-4 text-indigo-500" />{credits} credits</div>
            <button onClick={() => setDark(!dark)} className={`${ghost} !p-2.5`} title="Theme">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white grid place-items-center text-sm font-black">{(prof?.name || user?.email || '?').charAt(0).toUpperCase()}</div>
          </div>
        </header>

        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
          {tab === 'dashboard' && (<>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 p-7 sm:p-9 text-white shadow-xl shadow-indigo-500/25">
              <svg className="absolute right-0 bottom-0 h-full opacity-25" viewBox="0 0 400 200" preserveAspectRatio="xMaxYMax slice"><path d="M0 200 L90 70 L150 140 L240 30 L340 150 L400 90 V200Z" fill="#fff" /><circle cx="330" cy="40" r="22" fill="#fff" /></svg>
              <div className="relative max-w-lg"><div className="text-xs font-bold uppercase tracking-widest opacity-80">Welcome back</div>
                <h1 className="text-2xl sm:text-3xl font-black mt-1">Welcome {prof?.name || user?.email?.split('@')[0] || ''}</h1>
                <p className="mt-1 text-sm opacity-90">All systems are running smoothly. Here&apos;s what&apos;s happening with your panel today.</p>
                <div className="mt-5 flex flex-wrap gap-2"><button onClick={() => { setTab('users'); setModal(true); }} className={`${btn} bg-white text-indigo-600 hover:bg-indigo-50`}><UserPlus className="h-4 w-4" />Add User</button>
                  <button onClick={() => setTab('credit')} className={`${btn} bg-white/20 text-white hover:bg-white/30`}><PlusCircle className="h-4 w-4" />Add Credit</button></div></div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <Stat icon={Users} label="Total Accounts" value={accounts.length} tone="bg-indigo-500" />
              <Stat icon={Check} label="Active" value={active} tone="bg-emerald-500" />
              <Stat icon={Network} label="Total Resellers" value={resellers.length} tone="bg-violet-500" />
              <Stat icon={Wallet} label="Credits" value={credits} tone="bg-amber-500" />
            </div>
            <div className="mt-8"><Head t="Recent Users" s="Latest subscribers"><button onClick={() => setTab('users')} className={ghost}>View all</button></Head><UsersTable rows={accounts.slice(0, 5)} compact /></div>
            <div className={`${card} p-5 mt-6 flex items-center gap-3`}><Server className="h-5 w-5 text-indigo-500" /><div className="text-sm"><b>Servers (Failover Pool)</b> <span className="text-[var(--mut)]">· real servers will be connected here</span></div></div>
          </>)}

          {tab === 'users' && (<>
            <Head t="Users" s="Customers by phone number"><button onClick={() => setModal(true)} className={primary}><UserPlus className="h-4 w-4" />Add User</button></Head>
            <div className="relative mb-4"><Search className="absolute left-3.5 top-3 h-4 w-4 text-[var(--mut)]" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search phone number…" className={`${inp} pl-10`} /></div>
            <UsersTable rows={list} />
          </>)}

          {tab === 'resellers' && (<>
            <Head t="Resellers" s={isAdmin ? 'Registered reseller accounts' : 'Visible to admin only'} />
            <div className={`${card} overflow-x-auto`}><table className="w-full min-w-[560px] text-sm"><thead><tr className="text-left text-[11px] uppercase tracking-wider text-[var(--mut)] bg-[var(--soft)]">{['Name', 'WhatsApp', 'Credits', 'Joined', ''].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
              <tbody>{[...(isAdmin && prof ? [{ ...prof, name: (prof.name || 'Me') + ' (you)' }] : []), ...resellers].map((r: any) => <tr key={r.id} className="border-t border-[var(--line)]"><td className="px-4 py-3 font-bold">{r.name}</td><td className="px-4 py-3">{r.whatsapp || '-'}</td><td className="px-4 py-3">{r.credits ?? 0}</td><td className="px-4 py-3">{new Date(r.created_at).toLocaleDateString()}</td><td className="px-4 py-3">{isAdmin && <button onClick={() => { setCreditTo(r.id); setTopup(0); setTab('credit'); }} className={`${ghost} !px-3 !py-1.5 text-xs`}>Add credit</button>}</td></tr>)}
                {resellers.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-[var(--mut)]">No resellers</td></tr>}</tbody></table></div>
          </>)}

          {tab === 'credit' && (<>
            <Head t="Add Credit" s={isAdmin ? 'Add credit to a reseller balance' : 'Credit is added by the admin'} />
            {!isAdmin ? <div className={`${card} p-6 text-sm space-y-2`}><div>Your credits: <b>{credits}</b> (1 credit = 1 month)</div><div className="text-[var(--mut)]">Minimum package: 10 credits (৳2000). To buy credits, contact the admin on WhatsApp.</div></div> : (<>
              <select className={`${inp} mb-4`} value={creditTo} onChange={(e) => setCreditTo(e.target.value)}><option value="">Select reseller</option>{[...(prof ? [{ ...prof, name: (prof.name || 'Me') + ' (my account)' }] : []), ...resellers].map((r: any) => <option key={r.id} value={r.id}>{r.name} ({r.credits ?? 0} credits)</option>)}</select>
              <label className="text-xs font-bold text-[var(--mut)]">Credits to add (1 credit = 1 month)</label>
              <input type="number" inputMode="numeric" min={1} placeholder="Type credits, e.g. 10" value={topup || ''} onChange={(e) => setTopup(Number(e.target.value))} className={`${inp} mb-3`} />
              <div className="flex flex-wrap gap-2 mb-4">{[10, 20, 50, 100].map((v) => (
                <button key={v} type="button" onClick={() => setTopup(v)} className={`${ghost} !px-3 !py-1.5 text-xs`}>{v}</button>))}</div>
              <label className="text-xs font-bold text-[var(--mut)]">Coupon code (optional)</label>
              <div className="flex gap-2 mb-3"><input value={coupon} onChange={(e) => { setCoupon(e.target.value); setCouponPct(0); }} placeholder="Coupon" className={inp} /><button type="button" className={ghost} onClick={checkCoupon}>Apply</button></div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-4 py-3 text-sm"><span className="text-[var(--mut)]">Payable (10 credits = ৳2000){couponPct > 0 ? ` · ${couponPct}% off` : ''}</span><b className="text-lg">৳{Math.round((topup || 0) * PER_CREDIT * (100 - couponPct) / 100)}</b></div>
              <button disabled={!creditTo || !topup} className={`${primary} mt-5 disabled:opacity-50`} onClick={addCredit}><Wallet className="h-4 w-4" />Add {topup || 0} Credits</button>
              <div className={`${card} p-5 mt-8`}>
                <div className="font-black mb-3">Coupons</div>
                <div className="flex gap-2 mb-3"><input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="CODE" className={inp} /><input type="number" min={1} max={100} value={newPct} onChange={(e) => setNewPct(Number(e.target.value))} className={`${inp} !w-24`} /><button type="button" className={primary} onClick={saveCoupon}>Add</button></div>
                {coupons.length === 0 && <div className="text-sm text-[var(--mut)]">No coupons yet. Percent off is applied when you add credits.</div>}
                {coupons.map((c) => <div key={c.code} className="flex items-center justify-between border-t border-[var(--line)] py-2 text-sm"><span><b>{c.code}</b> · {c.percent}% off</span><button type="button" className="text-rose-500" onClick={() => delCoupon(c.code)}>Delete</button></div>)}
              </div></>)}</>)}

          {tab === 'activity' && (<><Head t="Activity" s="Recent panel activity" />
            <div className={`${card} divide-y divide-[var(--line)]`}>{log.map((l, i) => <div key={i} className="flex gap-4 px-5 py-3.5 text-sm"><span className="w-44 shrink-0 text-xs text-[var(--mut)]">{l.t}</span><span className="font-semibold">{l.m}</span></div>)}</div></>)}

          {tab === 'api' && (<><Head t="API" s="Reseller API (design preview)" />
            <div className={`${card} p-5 mb-4`}><div className="text-xs font-bold text-[var(--mut)] mb-2">API KEY</div>
              <div className="flex gap-2"><input readOnly value="demo-key-xxxx-xxxx-xxxx" className={inp} /><button className={ghost} onClick={() => flash('k', 'demo-key-xxxx-xxxx-xxxx')}>{copied === 'k' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button></div></div>
            <div className={`${card} divide-y divide-[var(--line)] font-mono text-xs`}>{['POST /v1/openvpn/provision', 'POST /v1/openvpn/renew', 'POST /v1/openvpn/suspend', 'GET  /v1/openvpn/usage'].map((e) => <div key={e} className="px-5 py-3.5">{e}</div>)}</div>
            <p className="mt-3 text-xs text-[var(--mut)]">These endpoints are design-only for now and will be built once the server is connected.</p></>)}

          {tab === 'profile' && (<><Head t="User Profile" s={user?.email} />
            <div className={`${card} p-6 max-w-lg space-y-3`}>
              <div><label className="text-xs font-bold text-[var(--mut)]">Name</label><input value={pName} onChange={(e) => setPName(e.target.value)} className={inp} /></div>
              <div><label className="text-xs font-bold text-[var(--mut)]">WhatsApp</label><input value={pWa} onChange={(e) => setPWa(e.target.value)} placeholder="+880…" className={inp} /></div>
              <div className="text-xs text-[var(--mut)]">Role: <b>{prof?.role}</b></div>
              <button className={primary} onClick={saveProfile}>Save</button></div></>)}
        </div>
      </main>

      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setModal(false)}>
          <div className={`${card} w-full max-w-md p-6`} onClick={(e) => e.stopPropagation()} style={dark ? DARK as any : LIGHT as any}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-black">Add User</h3><button onClick={() => setModal(false)}><X className="h-5 w-5" /></button></div>
            <div className="space-y-3">
              <input className={inp} inputMode="tel" placeholder="Customer phone / WhatsApp number with country code" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <select className={inp} value={form.months} onChange={(e) => setForm({ ...form, months: Number(e.target.value) })}>{[1, 2, 3, 6, 12].map((m) => <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>)}</select>
              <select className={inp} value={form.bw} onChange={(e) => setForm({ ...form, bw: e.target.value })}>{['Unlimited', '10', '30', '50', '100', '200', '500'].map((b) => <option key={b} value={b}>{b === 'Unlimited' ? 'Unlimited bandwidth' : `${b} GB bandwidth`}</option>)}</select>
              <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-4 py-3 text-sm"><span className="text-[var(--mut)]">{isAdmin ? 'Admin account: no credits are used' : 'Credits used (1 credit = 1 month)'}</span><b className="text-lg">{isAdmin ? 0 : form.months}</b></div>
              <div className="text-xs text-[var(--mut)]">One account per phone number. The same number cannot be added twice.</div>
              {err && <div className="text-sm font-semibold text-rose-500">{err}</div>}
              <button className={`${primary} w-full`} onClick={create}>Create Account</button>
            </div>
          </div>
        </div>
      )}

      {renewFor && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setRenewFor(null)}>
          <div className={`${card} w-full max-w-sm p-6`} onClick={(e) => e.stopPropagation()} style={dark ? DARK as any : LIGHT as any}>
            <div className="flex items-center justify-between mb-3"><h3 className="text-lg font-black">Renew {renewFor.username}</h3><button onClick={() => setRenewFor(null)}><X className="h-5 w-5" /></button></div>
            <div className="text-xs text-[var(--mut)] mb-3">Start: {renewFor.startDate || '-'} · Expires: {renewFor.expiryDate}</div>
            <select className={`${inp} mb-3`} value={renewMonths} onChange={(e) => setRenewMonths(Number(e.target.value))}>{[0, 1, 2, 3, 6, 12].map((m) => <option key={m} value={m}>{m === 0 ? 'No extra months' : `${m} month${m > 1 ? 's' : ''}`}</option>)}</select>
            {renewFor.bandwidthType === 'Limited' && <select className={`${inp} mb-3`} value={renewGb} onChange={(e) => setRenewGb(Number(e.target.value))}>{[0, 10, 30, 50, 100, 200, 500].map((g) => <option key={g} value={g}>{g === 0 ? 'No extra bandwidth' : `Add ${g} GB`}</option>)}</select>}
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-4 py-3 text-sm mb-4"><span className="text-[var(--mut)]">{isAdmin ? 'Admin: no credits used' : 'Credits deducted'}</span><b className="text-lg">{isAdmin ? 0 : renewMonths}</b></div>
            <button className={`${primary} w-full`} onClick={renew}>Renew</button>
          </div>
        </div>
      )}

      {dnsLink && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setDnsLink(null)}>
          <div className={`${card} w-full max-w-md p-6`} onClick={(e) => e.stopPropagation()} style={dark ? DARK as any : LIGHT as any}>
            <div className="flex items-center justify-between mb-1"><h3 className="text-lg font-black">Customer link</h3><button onClick={() => setDnsLink(null)}><X className="h-5 w-5" /></button></div>
            <p className="text-sm text-[var(--mut)] mb-4">Send this private link to {dnsLink.username}. They can download the iPhone profile, copy the Android DNS hostname and activate their IP from it.</p>
            <div className="mb-3 rounded-xl bg-[var(--soft)] px-3.5 py-2.5"><div className="break-all text-xs font-semibold">{dnsLink.url}</div></div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button className={ghost} onClick={() => flash('dnslink', dnsLink.url)}>{copied === 'dnslink' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy link</button>
              <a className={primary} target="_blank" rel="noreferrer" href={`https://wa.me/${waNumber(dnsLink.username)}?text=${encodeURIComponent('Your MaheHub DNS is ready. Open this link to set it up: ' + dnsLink.url)}`}><MessageCircle className="h-4 w-4" /> Send on WhatsApp</a>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className={ghost} onClick={() => dnsAction('clear', dnsLink.username)}>Clear IP</button>
              {isAdmin && <button className={ghost} onClick={() => dnsAction('unblock', dnsLink.username)}>Unblock</button>}
            </div>
          </div>
        </div>
      )}

      {slip && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setSlip(null)}>
          <div className={`${card} w-full max-w-md p-6`} onClick={(e) => e.stopPropagation()} style={dark ? DARK as any : LIGHT as any}>
            <div className="flex items-center justify-between mb-1"><h3 className="text-lg font-black">Your VPN Account is Ready</h3><button onClick={() => setSlip(null)}><X className="h-5 w-5" /></button></div>
            <p className="text-sm text-[var(--mut)] mb-4">Send these details to the customer on WhatsApp</p>
            {([['Phone number', slip.username], ['Expires', slip.expiryDate], ['Import Link', slip.importLink]] as [string, string][]).map(([k, v]) => (
              <div key={k} className="mb-2 flex items-center gap-2 rounded-xl bg-[var(--soft)] px-3.5 py-2.5"><div className="min-w-0 flex-1"><div className="text-[10px] font-bold uppercase text-[var(--mut)]">{k}</div><div className="truncate text-sm font-semibold">{v}</div></div>
                <button className={`${ghost} !p-2`} onClick={() => flash(k, v)}>{copied === k ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button></div>))}
            <button className={`${primary} w-full mt-3`} onClick={() => flash('all', `Phone: ${slip.username}\nExpires: ${slip.expiryDate}\nImport Link: ${slip.importLink}`)}>{copied === 'all' ? 'Copied!' : 'COPY ALL'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
