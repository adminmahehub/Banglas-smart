'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Users, Network, PlusCircle, Activity, KeyRound, UserCircle, LogOut, Search,
  Menu, X, Copy, Moon, Sun, Home, Trash2, RefreshCw, Ban, Download, UserPlus, Wallet, Server, Check,
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
const HOST = { Normal: 'my.ovpn.ovh', VIP: 'vip.ovpn.ovh' } as const;
const card = 'rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-[0_8px_30px_rgba(60,72,140,0.07)]';
const inp = 'w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-indigo-400';
const btn = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition active:scale-95';
const primary = `${btn} bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:brightness-110`;
const ghost = `${btn} border border-[var(--line)] bg-[var(--card)] text-[var(--ink)] hover:bg-[var(--soft)]`;

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
  const [auth, setAuth] = useState({ email: '', password: '', name: '', signup: false });
  const [msg, setMsg] = useState('');
  const [creditTo, setCreditTo] = useState('');
  const [pName, setPName] = useState('');
  const [pWa, setPWa] = useState('');
  const balance = Number(prof?.balance_bdt ?? 0);
  const isAdmin = prof?.role === 'admin';
  const [q, setQ] = useState('');
  const [log, setLog] = useState<{ t: string; m: string }[]>([]);
  const [modal, setModal] = useState(false);
  const [slip, setSlip] = useState<OpenVpnAccount | null>(null);
  const [resellers, setResellers] = useState<any[]>([]);
  const [form, setForm] = useState({ u: '', p: '', tier: 'Normal', bw: '30', days: 30 });
  const [err, setErr] = useState('');
  const [topup, setTopup] = useState(1000);
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
    setLog((a.data || []).map((x: any) => ({ t: new Date(x.created_at).toLocaleString(), m: x.message })));
  };
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => setUser(sess?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => { if (user) load(); else { setProf(null); setAccounts([]); } }, [user]);

  const price = Math.round((PRICE[form.tier][form.bw] * form.days) / 30);
  const list = useMemo(() => accounts.filter((a) => a.username.toLowerCase().includes(q.toLowerCase())), [accounts, q]);
  const active = accounts.filter((a) => a.status === 'active').length;
  const flash = (k: string, t: string) => { copy(t); setCopied(k); setTimeout(() => setCopied(''), 1200); };

  async function doAuth() {
    setMsg('');
    const r = auth.signup
      ? await supabase.auth.signUp({ email: auth.email, password: auth.password, options: { data: { name: auth.name } } })
      : await supabase.auth.signInWithPassword({ email: auth.email, password: auth.password });
    if (r.error) return setMsg(r.error.message);
    if (auth.signup && !r.data.session) setMsg('Account created. Check your email to confirm, then log in.');
  }
  async function create() {
    setErr('');
    const { data, error } = await supabase.rpc('create_vpn_account', { p_username: form.u, p_password: form.p, p_tier: form.tier, p_bw: form.bw, p_days: form.days });
    if (error) return setErr(error.message);
    await load(); setModal(false); setSlip(toAcc(data)); setForm({ u: '', p: '', tier: 'Normal', bw: '30', days: 30 });
  }
  async function setStatus(id: string, status: OpenVpnAccount['status'], username: string) {
    const { error } = await supabase.from('vpn_accounts').update({ status }).eq('id', id);
    if (error) { alert(error.message); return; }
    // on suspend/expired, also revoke the certificate on the server (the server retries every minute if this fails)
    if (status !== 'active') await supabase.functions.invoke('vpn-provision', { body: { username, action: 'revoke' } });
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
    const { error } = await supabase.from('vpn_accounts').delete().eq('id', a.id);
    if (error) alert(error.message); else load();
  }
  async function addCredit() {
    const { error } = await supabase.rpc('admin_add_credit', { p_user: creditTo, p_amount: topup, p_note: 'Admin top-up' });
    if (error) alert(error.message); else { alert('Credit added'); load(); }
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
          {['Username', 'Bandwidth', 'Validity', 'Status', ...(compact ? [] : ['Actions'])].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}
        </tr></thead>
        <tbody>{rows.map((a) => (
          <tr key={a.id} className="border-t border-[var(--line)] text-[var(--ink)]">
            <td className="px-4 py-3"><div className="font-bold">{a.username}</div><div className="text-xs text-[var(--mut)]">{a.server} · {a.serverHost}</div></td>
            <td className="px-4 py-3 w-52"><div className="text-xs mb-1 text-[var(--mut)]">{fmtGb(a)}</div>
              <div className="h-1.5 rounded-full bg-[var(--soft)]"><div className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${pct(a)}%` }} /></div></td>
            <td className="px-4 py-3 text-xs font-semibold">{a.expiryDate}</td>
            <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${a.status === 'active' ? 'bg-emerald-500/15 text-emerald-600' : a.status === 'suspended' ? 'bg-amber-500/15 text-amber-600' : 'bg-rose-500/15 text-rose-500'}`}>{a.status}</span></td>
            {!compact && <td className="px-4 py-3"><div className="flex gap-1.5">
              <button title="Import link / slip" onClick={() => setSlip(a)} className={`${ghost} !p-2`}><Copy className="h-4 w-4" /></button>
              <button title="Download .ovpn" onClick={() => download(a)} className={`${ghost} !p-2`}><Download className="h-4 w-4" /></button>
              <button title="Renew" onClick={() => setStatus(a.id, 'active', a.username)} className={`${ghost} !p-2`}><RefreshCw className="h-4 w-4" /></button>
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
            <div className={`${ghost} !py-1.5 cursor-default`}><Wallet className="h-4 w-4 text-indigo-500" />৳{balance.toFixed(2)}</div>
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
              <Stat icon={Wallet} label="Balance" value={`৳${balance}`} tone="bg-amber-500" />
            </div>
            <div className="mt-8"><Head t="Recent Users" s="Latest subscribers"><button onClick={() => setTab('users')} className={ghost}>View all</button></Head><UsersTable rows={accounts.slice(0, 5)} compact /></div>
            <div className={`${card} p-5 mt-6 flex items-center gap-3`}><Server className="h-5 w-5 text-indigo-500" /><div className="text-sm"><b>Servers (Failover Pool)</b> <span className="text-[var(--mut)]">· real servers will be connected here</span></div></div>
          </>)}

          {tab === 'users' && (<>
            <Head t="Users" s="Active subscribers with bandwidth usage"><button onClick={() => setModal(true)} className={primary}><UserPlus className="h-4 w-4" />Add User</button></Head>
            <div className="relative mb-4"><Search className="absolute left-3.5 top-3 h-4 w-4 text-[var(--mut)]" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users..." className={`${inp} pl-10`} /></div>
            <UsersTable rows={list} />
          </>)}

          {tab === 'resellers' && (<>
            <Head t="Resellers" s={isAdmin ? 'Registered reseller accounts' : 'Visible to admin only'} />
            <div className={`${card} overflow-x-auto`}><table className="w-full min-w-[560px] text-sm"><thead><tr className="text-left text-[11px] uppercase tracking-wider text-[var(--mut)] bg-[var(--soft)]">{['Name', 'WhatsApp', 'Balance', 'Joined'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
              <tbody>{resellers.map((r) => <tr key={r.id} className="border-t border-[var(--line)]"><td className="px-4 py-3 font-bold">{r.name}</td><td className="px-4 py-3">{r.whatsapp || '-'}</td><td className="px-4 py-3">৳{r.balance_bdt}</td><td className="px-4 py-3">{new Date(r.created_at).toLocaleDateString()}</td></tr>)}
                {resellers.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-[var(--mut)]">No resellers</td></tr>}</tbody></table></div>
          </>)}

          {tab === 'credit' && (<>
            <Head t="Add Credit" s={isAdmin ? 'Add credit to a reseller balance' : 'Credit is added by the admin'} />
            {!isAdmin ? <div className={`${card} p-6 text-sm`}>Your balance: <b>৳{balance}</b>. To add credit, contact the admin on WhatsApp.</div> : (<>
              <select className={`${inp} mb-4`} value={creditTo} onChange={(e) => setCreditTo(e.target.value)}><option value="">Select reseller</option>{resellers.map((r) => <option key={r.id} value={r.id}>{r.name} (৳{r.balance_bdt})</option>)}</select>
              <div className="grid sm:grid-cols-2 gap-4">{[500, 1000, 2000, 5000].map((v) => (
                <button key={v} onClick={() => setTopup(v)} className={`${card} p-6 text-left transition ${topup === v ? '!border-indigo-500 ring-2 ring-indigo-500/30' : ''}`}>
                  <div className="text-3xl font-black">৳{v}</div><div className="text-sm text-[var(--mut)] mt-1">Top-up package</div></button>))}</div>
              <button disabled={!creditTo} className={`${primary} mt-5 disabled:opacity-50`} onClick={addCredit}><Wallet className="h-4 w-4" />Add ৳{topup} Credit</button></>)}
          </>)}

          {tab === 'activity' && (<><Head t="Activity" s="Panel ki recent activity" />
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
              <input className={inp} placeholder="Username (min 8)" value={form.u} onChange={(e) => setForm({ ...form, u: e.target.value })} />
              <input className={inp} placeholder="Password (min 6)" value={form.p} onChange={(e) => setForm({ ...form, p: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select className={inp} value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}><option value="Normal">Normal Server</option><option value="VIP">VIP Brilliant</option></select>
                <select className={inp} value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })}><option value={30}>30 Days</option><option value={50}>50 Days</option><option value={90}>90 Days</option></select>
              </div>
              <select className={inp} value={form.bw} onChange={(e) => setForm({ ...form, bw: e.target.value })}><option value="10">10 GB</option><option value="30">30 GB</option><option value="200">200 GB</option><option value="Unlimited">Unlimited</option></select>
              <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-4 py-3 text-sm"><span className="text-[var(--mut)]">Price (balance se kate ga)</span><b className="text-lg">৳{price}</b></div>
              {err && <div className="text-sm font-semibold text-rose-500">{err}</div>}
              <button className={`${primary} w-full`} onClick={create}>Create Account</button>
            </div>
          </div>
        </div>
      )}

      {slip && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setSlip(null)}>
          <div className={`${card} w-full max-w-md p-6`} onClick={(e) => e.stopPropagation()} style={dark ? DARK as any : LIGHT as any}>
            <div className="flex items-center justify-between mb-1"><h3 className="text-lg font-black">Your VPN Account is Ready</h3><button onClick={() => setSlip(null)}><X className="h-5 w-5" /></button></div>
            <p className="text-sm text-[var(--mut)] mb-4">Send these details to the customer on WhatsApp</p>
            {([['Username', slip.username], ['Password', slip.password], ['Import Link', slip.importLink]] as [string, string][]).map(([k, v]) => (
              <div key={k} className="mb-2 flex items-center gap-2 rounded-xl bg-[var(--soft)] px-3.5 py-2.5"><div className="min-w-0 flex-1"><div className="text-[10px] font-bold uppercase text-[var(--mut)]">{k}</div><div className="truncate text-sm font-semibold">{v}</div></div>
                <button className={`${ghost} !p-2`} onClick={() => flash(k, v)}>{copied === k ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button></div>))}
            <button className={`${primary} w-full mt-3`} onClick={() => flash('all', `Username: ${slip.username}\nPassword: ${slip.password}\nImport Link: ${slip.importLink}`)}>{copied === 'all' ? 'Copied!' : 'COPY ALL'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
