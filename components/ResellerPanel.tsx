'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Users, Network, PlusCircle, Activity, KeyRound, UserCircle, LogOut, Search,
  Menu, X, Copy, Moon, Sun, Home, Trash2, RefreshCw, Ban, Download, UserPlus, Wallet, Server, Check, Link2, MessageCircle,
} from 'lucide-react';
import type { OpenVpnAccount } from '../lib/suauthData';
import { supabase } from '../lib/supabase';
import { COUNTRIES } from '../lib/countries';

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
function validWa(s: string) { return /^\+[1-9][0-9]{7,14}$/.test(String(s).replace(/[\s()-]/g, '')); }
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
  const [form, setForm] = useState({ country: 'BD', phone: '', months: 1 });
  const [trial, setTrial] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);
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
  const [reqs, setReqs] = useState<any[]>([]);
  const [pay, setPay] = useState({ method: 'bKash', number: '', price: 200 });
  const [reqCredits, setReqCredits] = useState<number>(10);
  const [trx, setTrx] = useState('');
  const [refCode, setRefCode] = useState('');
  const [payEdit, setPayEdit] = useState({ method: '', number: '', price: '' });
  const [stats, setStats] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [live, setLive] = useState<Record<string, any>>({});
  const [refInfo, setRefInfo] = useState<{ code: string; direct_count: number; bonus_credits: number } | null>(null);
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
    const cr = await supabase.from('credit_requests').select('*').order('created_at', { ascending: false }).limit(100);
    setReqs(cr.data || []);
    if (me?.role === 'admin') { const ds = await supabase.rpc('admin_dashboard_stats'); setStats(ds.data || null); } else setStats(null);
    const lv = await supabase.rpc('customer_live_status');
    const lm: Record<string, any> = {}; ((lv.data as any[]) || []).forEach((x: any) => { lm[x.username] = x; });
    setLive(lm);
    const tm = await supabase.rpc('my_team');
    setTeam(tm.data || []);
    const ri = await supabase.rpc('my_referral_info');
    setRefInfo(ri.data || null);
    const nt = await supabase.rpc('pending_expiry_notices');
    setNotices(nt.data || []);
    const st = await supabase.from('app_settings').select('key,value');
    const sm: Record<string, string> = {}; (st.data || []).forEach((x: any) => { sm[x.key] = x.value; });
    setPay({ method: sm.pay_method || 'bKash', number: sm.pay_number || '', price: Number(sm.price_per_credit) || PER_CREDIT });
    setPayEdit({ method: sm.pay_method || 'bKash', number: sm.pay_number || '', price: String(Number(sm.price_per_credit) || PER_CREDIT) });
    setLog((a.data || []).map((x: any) => ({ t: new Date(x.created_at).toLocaleString(), m: x.message })));
  };
  useEffect(() => {
    try {
      const c = (new URLSearchParams(window.location.search).get('ref') || sessionStorage.getItem('mh_ref') || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
      if (c) { setRefCode(c); setAuth((a) => ({ ...a, signup: true })); }
    } catch { /* ignore */ }
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
    if (auth.signup && !validWa(auth.whatsapp)) return setMsg('Enter your WhatsApp number with country code, starting with + (example +966501234567)');
    const r = auth.signup
      ? await supabase.auth.signUp({ email: auth.email, password: auth.password, options: { data: { name: auth.name, whatsapp: auth.whatsapp.replace(/[\s()-]/g, ''), ...(refCode ? { ref: refCode } : {}) } } })
      : await supabase.auth.signInWithPassword({ email: auth.email, password: auth.password });
    if (r.error) return setMsg(r.error.message);
    if (auth.signup && !r.data.session) setMsg('Account created. Check your email to confirm, then log in.');
  }
  async function create() {
    setErr('');
    const local = form.phone.replace(/\D/g, '').replace(/^0+/, '');
    if (local.length < 6) return setErr('Enter the phone number');
    const full = (COUNTRIES.find((c) => c.id === form.country)?.cc || '880') + local;
    const { data, error } = trial
      ? await supabase.rpc('create_trial_customer', { p_phone: full })
      : await supabase.rpc('create_customer', { p_phone: full, p_months: form.months, p_bw: 'Unlimited' });
    if (error) return setErr(error.message);
    await load(); setModal(false); setTrial(false); setForm({ country: form.country, phone: '', months: 1 });
    const lk = await supabase.rpc('generate_customer_link', { p_username: data.username });
    if (lk.error || !lk.data) { alert('Account created, but the link could not be made: ' + (lk.error?.message || 'unknown error') + '. Use the Customer link button in the Users list.'); return; }
    setDnsLink({ username: data.username, url: `${window.location.origin}/c/?t=${lk.data}` });
  }
  async function savePayment() {
    const { error } = await supabase.rpc('admin_set_payment', { p_method: payEdit.method, p_number: payEdit.number, p_price: Number(payEdit.price) });
    if (error) { alert(error.message); return; }
    alert('Payment details saved. Resellers will see the new number.'); load();
  }
  async function submitTopup() {
    const n = Math.floor(Number(reqCredits));
    if (!n || n < 10) { alert('Minimum package is 10 credits.'); return; }
    if (trx.trim().length < 6) { alert('Enter the Transaction ID (TrxID) of your payment.'); return; }
    const { error } = await supabase.rpc('request_credit_topup', { p_credits: n, p_trx: trx, p_method: pay.method });
    if (error) { alert(error.message); return; }
    alert('Request sent. Your credits will be added after the admin checks the payment.'); setTrx(''); load();
  }
  async function resolveReq(id: string, ok: boolean) {
    if (!confirm(ok ? 'Approve this request and add the credits?' : 'Reject this request?')) return;
    const { error } = await supabase.rpc('resolve_credit_request', { p_id: id, p_approve: ok });
    if (error) alert(error.message); else load();
  }
  async function makeLink(a: OpenVpnAccount) {
    if (!confirm('Create a new customer link for ' + a.username + '? If a link was sent before, it will stop working.')) return;
    const { data, error } = await supabase.rpc('generate_customer_link', { p_username: a.username });
    if (error || !data) { alert('Could not create the link: ' + (error?.message || 'unknown error')); return; }
    setDnsLink({ username: a.username, url: `${window.location.origin}/c/?t=${data}` });
  }
  async function dnsAction(kind: 'clear' | 'unblock', username: string) {
    const { error } = await supabase.rpc(kind === 'clear' ? 'dns_clear_ip' : 'dns_unblock', { p_username: username });
    alert(error ? error.message : (kind === 'clear' ? 'Device lock cleared. The customer can now press Activate on the new phone.' : 'Customer unblocked.'));
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
    if (!validWa(pWa)) return alert('WhatsApp number must start with + and the country code (example +966501234567)');
    const { error } = await supabase.from('profiles').update({ name: pName, whatsapp: pWa.replace(/[\s()-]/g, '') }).eq('id', user.id);
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

  const Reminders = () => notices.length === 0 ? null : (
    <div className={`${card} p-5 mb-5`}>
      <div className="flex items-center gap-2 mb-1"><MessageCircle className="h-5 w-5 text-emerald-500" /><h3 className="font-black text-[var(--ink)]">Expired customers ({notices.length})</h3></div>
      <p className="text-sm text-[var(--mut)] mb-3">Send a renewal reminder on WhatsApp. A customer leaves this list once you send it.</p>
      <div className="space-y-2">{notices.map((n: any) => (
        <div key={`${n.account_id}-${n.expiry_marker}`} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--soft)] px-3.5 py-2.5">
          <div className="text-sm font-bold">{n.phone}</div>
          <a className={`${primary} !py-1.5`} target="_blank" rel="noreferrer" href={`https://wa.me/${waNumber(n.phone)}?text=${encodeURIComponent(n.message)}`}
            onClick={async () => { await supabase.rpc('mark_expiry_notice_sent', { p_account_id: n.account_id, p_expiry_marker: n.expiry_marker }); setTimeout(load, 800); }}>
            <MessageCircle className="h-4 w-4" /> Send on WhatsApp</a>
        </div>))}</div>
    </div>
  );

  const connBadge = (u: string, status: string) => {
    const l = live[u];
    const ago = (t: string) => { const m = Math.max(0, Math.round((Date.now() - new Date(t).getTime()) / 60000)); return m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`; };
    let t = '-', c = 'bg-slate-500/15 text-slate-500';
    if (!l) return <span className="text-xs text-[var(--mut)]">-</span>;
    if (status !== 'active') { t = 'Expired / off'; c = 'bg-rose-500/15 text-rose-500'; }
    else if (l.blocked) { t = 'Blocked'; c = 'bg-rose-500/15 text-rose-500'; }
    else if (!l.has_link) { t = 'No link sent'; }
    else if (!l.bound_ip) { t = 'Not activated yet'; c = 'bg-amber-500/15 text-amber-600'; }
    else if (l.last_seen && Date.now() - new Date(l.last_seen).getTime() < 5 * 60000) { t = 'Online now'; c = 'bg-emerald-500/15 text-emerald-600'; }
    else if (l.last_seen) { t = `Last seen ${ago(l.last_seen)}`; c = 'bg-sky-500/15 text-sky-600'; }
    else { t = `Activated${l.bound_at ? ' · ' + ago(l.bound_at) : ''}, not seen yet`; c = 'bg-amber-500/15 text-amber-600'; }
    return <div><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${c}`}>{t}</span>{l?.bound_ip && status === 'active' && <div className="mt-1 text-[10px] text-[var(--mut)] font-mono">{l.bound_ip}{l.trial ? ' · trial' : ''}</div>}</div>;
  };
  const UsersTable = ({ rows, compact }: { rows: OpenVpnAccount[]; compact?: boolean }) => (
    <div className={`${card} overflow-hidden`}>
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm">
        <thead><tr className="text-left text-[11px] uppercase tracking-wider text-[var(--mut)] bg-[var(--soft)]">
          {['Phone number', 'Bandwidth', 'Start date', 'Expire date', 'Status', 'Connection', ...(compact ? [] : ['Actions'])].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}
        </tr></thead>
        <tbody>{rows.map((a) => (
          <tr key={a.id} className="border-t border-[var(--line)] text-[var(--ink)]">
            <td className="px-4 py-3"><div className="font-bold">{a.username}</div></td>
            <td className="px-4 py-3 text-xs font-semibold"><div className="h-1.5 w-24 rounded-full bg-[var(--line)] overflow-hidden mb-1"><div className="h-full rounded-full bg-violet-500" style={{ width: a.bandwidthType === 'Unlimited' ? '8%' : `${Math.min(100, (a.usedMb / (a.bandwidthGb * 1024)) * 100)}%` }} /></div>{(a.usedMb / 1024).toFixed(1)} GB / {a.bandwidthType === 'Unlimited' ? 'Unlimited' : `${a.bandwidthGb} GB`}</td>
            <td className="px-4 py-3 text-xs font-semibold">{a.startDate ? new Date(a.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
            <td className="px-4 py-3 text-xs font-semibold">{a.expiryDate}</td>
            <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${a.status === 'active' ? 'bg-emerald-500/15 text-emerald-600' : a.status === 'suspended' ? 'bg-amber-500/15 text-amber-600' : 'bg-rose-500/15 text-rose-500'}`}>{a.status}</span></td>
            <td className="px-4 py-3">{connBadge(a.username, a.status)}</td>
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
        {auth.signup && refCode && <div className="mb-3 rounded-xl bg-[var(--soft)] px-3.5 py-2.5 text-xs text-[var(--mut)]">Invited by referral code <b className="text-[var(--ink)]">{refCode}</b></div>}
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
            {isAdmin && stats && (<>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <Stat icon={Wallet} label="Total Sales (৳)" value={Number(stats.total_sales_bdt).toLocaleString()} tone="bg-emerald-500" />
                <Stat icon={Wallet} label="This Month (৳)" value={Number(stats.month_sales_bdt).toLocaleString()} tone="bg-indigo-500" />
                <Stat icon={Activity} label="Expiring in 7 days" value={stats.expiring_7d} tone="bg-amber-500" />
                <Stat icon={Download} label="Pending Top-ups" value={stats.pending_topups} tone="bg-rose-500" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <Stat icon={Users} label="Customers" value={stats.customers} tone="bg-violet-500" />
                <Stat icon={Check} label="Active Customers" value={stats.active_customers} tone="bg-emerald-500" />
                <Stat icon={Ban} label="Expired" value={stats.expired_customers} tone="bg-slate-500" />
                <Stat icon={Wallet} label="Credits Sold" value={stats.total_credits_sold} tone="bg-amber-500" />
              </div>
              <div className={`${card} p-5 mt-6`}>
                <div className="font-black mb-3">Sales by month (last 6 months)</div>
                {(() => { const mx = Math.max(1, ...stats.monthly.map((m: any) => Number(m.sales_bdt))); return (
                  <div className="flex items-end gap-3 h-36">{stats.monthly.map((m: any) => (
                    <div key={m.month} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div className="text-[10px] text-[var(--mut)] mb-1">{Number(m.sales_bdt) ? Number(m.sales_bdt).toLocaleString() : ''}</div>
                      <div className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-violet-400" style={{ height: `${Math.max(3, (Number(m.sales_bdt) / mx) * 100)}%` }} />
                      <div className="text-[10px] mt-1 text-[var(--mut)]">{m.month}</div>
                    </div>))}</div>); })()}
              </div>
              <div className={`${card} mt-6 overflow-x-auto`}>
                <div className="px-5 pt-4 font-black">Sales by reseller</div>
                <table className="w-full min-w-[560px] text-sm mt-2"><thead><tr className="text-left text-[11px] uppercase tracking-wider text-[var(--mut)] bg-[var(--soft)]">{['Reseller', 'Own sales ৳', 'Team sales ৳', 'Customers'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
                  <tbody>{stats.per_reseller.map((r: any) => <tr key={r.id} className="border-t border-[var(--line)]"><td className="px-4 py-3 font-bold">{r.name}</td><td className="px-4 py-3">{Number(r.own_sales_bdt).toLocaleString()}</td><td className="px-4 py-3">{Number(r.team_sales_bdt).toLocaleString()}</td><td className="px-4 py-3">{r.active_customers}/{r.customers}</td></tr>)}
                    {stats.per_reseller.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-[var(--mut)]">No resellers yet</td></tr>}</tbody></table>
              </div>
            </>)}
            <div className="mt-8"><Reminders /><Head t="Recent Users" s="Latest subscribers"><button onClick={() => setTab('users')} className={ghost}>View all</button></Head><UsersTable rows={accounts.slice(0, 5)} compact /></div>
            <div className={`${card} p-5 mt-6 flex items-center gap-3`}><Server className="h-5 w-5 text-indigo-500" /><div className="text-sm"><b>Servers (Failover Pool)</b> <span className="text-[var(--mut)]">· real servers will be connected here</span></div></div>
          </>)}

          {tab === 'users' && (<>
            <Head t="Users" s="Customers by phone number"><button onClick={() => setModal(true)} className={primary}><UserPlus className="h-4 w-4" />Add User</button></Head>
            <div className="relative mb-4"><Search className="absolute left-3.5 top-3 h-4 w-4 text-[var(--mut)]" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search phone number…" className={`${inp} pl-10`} /></div>
            <Reminders />
            <UsersTable rows={list} />
          </>)}

          {tab === 'resellers' && (<>
            <Head t={isAdmin ? 'Resellers' : 'My Team'} s={isAdmin ? 'All reseller accounts, who invited them and their team sales' : 'Resellers who joined through your referral link'} />
            {isAdmin ? (
              <div className={`${card} overflow-x-auto`}><table className="w-full min-w-[760px] text-sm"><thead><tr className="text-left text-[11px] uppercase tracking-wider text-[var(--mut)] bg-[var(--soft)]">{['Name', 'WhatsApp', 'Credits', 'Invited by', 'Team', 'Team sales ৳', 'Joined', ''].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
                <tbody>{[...(prof ? [{ ...prof, name: (prof.name || 'Me') + ' (you)', _me: true }] : []), ...((stats?.per_reseller || resellers) as any[])].map((r: any) => <tr key={r.id} className="border-t border-[var(--line)]"><td className="px-4 py-3 font-bold">{r.name}</td><td className="px-4 py-3">{r.whatsapp || '-'}</td><td className="px-4 py-3">{r.credits ?? 0}</td><td className="px-4 py-3">{r._me ? '-' : (r.upline_name || 'Admin')}</td><td className="px-4 py-3">{r._me ? '-' : `${r.direct_count ?? 0} direct · ${r.team_count ?? 0} total`}</td><td className="px-4 py-3">{r._me ? '-' : Number(r.team_sales_bdt ?? 0).toLocaleString()}</td><td className="px-4 py-3">{new Date(r.created_at).toLocaleDateString()}</td><td className="px-4 py-3"><button onClick={() => { setCreditTo(r.id); setTopup(0); setTab('credit'); }} className={`${ghost} !px-3 !py-1.5 text-xs`}>Add credit</button></td></tr>)}
                  {resellers.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-[var(--mut)]">No resellers</td></tr>}</tbody></table></div>
            ) : (<>
              {refInfo?.code && <div className={`${card} p-4 mb-4 flex flex-wrap items-center gap-3 text-sm`}><Link2 className="h-4 w-4 text-indigo-500" /><span className="text-[var(--mut)]">Your invite link:</span><b className="break-all">{typeof window !== 'undefined' ? window.location.origin : ''}/?ref={refInfo.code}</b><button className={`${ghost} !py-1.5 ml-auto`} onClick={() => flash('ref2', `${window.location.origin}/?ref=${refInfo.code}`)}>{copied === 'ref2' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button></div>}
              <div className={`${card} overflow-x-auto`}><table className="w-full min-w-[560px] text-sm"><thead><tr className="text-left text-[11px] uppercase tracking-wider text-[var(--mut)] bg-[var(--soft)]">{['Name', 'WhatsApp', 'Level', 'Credits bought', 'Customers', 'Joined'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
                <tbody>{team.map((r: any) => <tr key={r.id} className="border-t border-[var(--line)]"><td className="px-4 py-3 font-bold">{r.name}</td><td className="px-4 py-3">{r.whatsapp || '-'}</td><td className="px-4 py-3">{r.level === 1 ? 'Direct' : `Level ${r.level}`}</td><td className="px-4 py-3">{r.credits_bought}</td><td className="px-4 py-3">{r.customers}</td><td className="px-4 py-3">{new Date(r.joined).toLocaleDateString()}</td></tr>)}
                  {team.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-[var(--mut)]">No one has joined through your link yet</td></tr>}</tbody></table></div>
            </>)}
          </>)}

          {tab === 'credit' && (<>
            <Head t="Add Credit" s={isAdmin ? 'Add credit to a reseller balance' : 'Buy credits and send the TrxID'} />
            {isAdmin && (
              <div className={`${card} p-6 text-sm space-y-3 mb-4`}>
                <div className="font-black">Payment details (shown to resellers when they buy credits)</div>
                <div><label className="text-xs font-bold text-[var(--mut)]">Method (example: bKash / Nagad)</label><input className={inp} value={payEdit.method} onChange={(e) => setPayEdit({ ...payEdit, method: e.target.value })} /></div>
                <div><label className="text-xs font-bold text-[var(--mut)]">Payment number(s)</label><input className={inp} value={payEdit.number} onChange={(e) => setPayEdit({ ...payEdit, number: e.target.value })} placeholder="01XXXXXXXXX (bKash personal)" /></div>
                <div><label className="text-xs font-bold text-[var(--mut)]">Price per credit (৳)</label><input className={inp} type="number" inputMode="numeric" value={payEdit.price} onChange={(e) => setPayEdit({ ...payEdit, price: e.target.value })} /></div>
                <button className={primary} onClick={savePayment}>Save payment details</button>
              </div>
            )}
            {!isAdmin ? (<div className="space-y-4">
              <div className={`${card} p-6 text-sm space-y-3`}>
                <div>Your credits: <b>{credits}</b> (1 credit = 1 month)</div>
                <div className="text-xs font-bold text-[var(--mut)]">Choose credits (minimum 10)</div>
                <div className="flex flex-wrap gap-2">{[10, 20, 30, 50].map((v) => (
                  <button key={v} type="button" onClick={() => setReqCredits(v)} className={`${reqCredits === v ? primary : ghost} !px-4 !py-1.5 text-xs`}>{v}</button>))}</div>
                <input type="number" inputMode="numeric" min={10} value={reqCredits || ''} onChange={(e) => setReqCredits(Number(e.target.value))} className={inp} placeholder="Or type credits" />
                <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-4 py-3"><span className="text-[var(--mut)]">Total price</span><b className="text-lg">৳{Math.max(0, Math.floor(reqCredits || 0)) * pay.price}</b></div>
                <div className="rounded-xl bg-[var(--soft)] px-4 py-3">
                  <div className="text-xs text-[var(--mut)]">Send the payment by {pay.method} to</div>
                  <div className="flex items-center gap-2"><b className="text-base break-all">{pay.number || 'Ask the admin for the payment number'}</b>{pay.number && <button type="button" className={`${ghost} !p-2`} onClick={() => flash('paynum', pay.number)}>{copied === 'paynum' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button>}</div>
                </div>
                <input value={trx} onChange={(e) => setTrx(e.target.value)} className={inp} placeholder="Transaction ID (TrxID) after payment" />
                <button type="button" disabled={!reqCredits || reqCredits < 10 || trx.trim().length < 6} className={`${primary} w-full disabled:opacity-50`} onClick={submitTopup}><Wallet className="h-4 w-4" />Submit payment</button>
              </div>
              {reqs.length > 0 && <div className={`${card} divide-y divide-[var(--line)]`}>{reqs.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm"><span><b>{r.credits}</b> credits · ৳{Number(r.amount_bdt)} · <span className="text-xs text-[var(--mut)]">{r.trx_id}</span></span><span className={`text-xs font-bold ${r.status === 'approved' ? 'text-emerald-500' : r.status === 'rejected' ? 'text-rose-500' : 'text-amber-500'}`}>{r.status}</span></div>))}</div>}
            </div>) : (<>
              {reqs.some((r) => r.status === 'pending') && <div className={`${card} p-5 mb-6`}>
                <div className="font-black mb-3">Payment requests</div>
                {reqs.filter((r) => r.status === 'pending').map((r) => (
                  <div key={r.id} className="border-t border-[var(--line)] py-3 text-sm">
                    <div><b>{resellers.find((x: any) => x.id === r.owner_id)?.name || 'Reseller'}</b> · {r.credits} credits · ৳{Number(r.amount_bdt)}</div>
                    <div className="text-xs text-[var(--mut)] mb-2">{r.method} · TrxID <b>{r.trx_id}</b> · {new Date(r.created_at).toLocaleString()}</div>
                    <div className="flex gap-2"><button type="button" className={`${primary} !py-1.5 text-xs`} onClick={() => resolveReq(r.id, true)}>Approve</button><button type="button" className={`${ghost} !py-1.5 text-xs`} onClick={() => resolveReq(r.id, false)}>Reject</button></div>
                  </div>))}
              </div>}
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
              <button className={primary} onClick={saveProfile}>Save</button></div>
            {refInfo?.code && (
              <div className={`${card} p-6 max-w-lg mt-4 space-y-3`}>
                <h3 className="font-black text-[var(--ink)]">Refer & earn</h3>
                <div className="text-xs text-[var(--mut)]">Share your link. When a reseller you invite makes their first top-up of 20+ credits, you get 10% of it as free credits (20 → 2, 50 → 5, 100 → 10).</div>
                <div className="flex items-center gap-2">
                  <input readOnly className={inp} value={`${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${refInfo.code}`} />
                  <button className={ghost} onClick={() => flash('ref', `${window.location.origin}/?ref=${refInfo.code}`)}>{copied === 'ref' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button>
                </div>
                <div className="flex gap-3 text-sm">
                  <div className="flex-1 rounded-xl bg-[var(--soft)] px-4 py-3"><div className="text-[11px] text-[var(--mut)]">Code</div><b>{refInfo.code}</b></div>
                  <div className="flex-1 rounded-xl bg-[var(--soft)] px-4 py-3"><div className="text-[11px] text-[var(--mut)]">Joined</div><b>{refInfo.direct_count}</b></div>
                  <div className="flex-1 rounded-xl bg-[var(--soft)] px-4 py-3"><div className="text-[11px] text-[var(--mut)]">Bonus credits</div><b>{refInfo.bonus_credits}</b></div>
                </div>
              </div>
            )}</>)}
        </div>
      </main>

      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setModal(false)}>
          <div className={`${card} w-full max-w-md p-6`} onClick={(e) => e.stopPropagation()} style={dark ? DARK as any : LIGHT as any}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-black">Add User</h3><button onClick={() => setModal(false)}><X className="h-5 w-5" /></button></div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <select className={`${inp} !w-36 shrink-0`} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>{COUNTRIES.map((c) => <option key={c.id} value={c.id}>{c.n} +{c.cc}</option>)}</select>
                <input className={inp} inputMode="tel" placeholder="WhatsApp number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <select className={inp} value={trial ? 'trial' : form.months} onChange={(e) => { if (e.target.value === 'trial') setTrial(true); else { setTrial(false); setForm({ ...form, months: Number(e.target.value) }); } }}><option value="trial">Trial (1 hour)</option>{[1, 2, 3, 6, 12].map((m) => <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>)}</select>
              <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-4 py-3 text-sm"><span className="text-[var(--mut)]">{isAdmin ? 'Admin account: no credits are used' : trial ? 'Trial: free, ends after 1 hour' : 'Credits used (1 credit = 1 month)'}</span><b className="text-lg">{isAdmin || trial ? 0 : form.months}</b></div>
              <div className="text-xs text-[var(--mut)]">One account per phone number. A private DNS link is made right after Create.</div>
              {err && <div className="text-sm font-semibold text-rose-500">{err}</div>}
              <button className={`${primary} w-full`} onClick={create}>Create & get link</button>
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
            {isAdmin && <div className="grid grid-cols-2 gap-2">
              <button className={ghost} onClick={() => dnsAction('clear', dnsLink.username)}>Clear device lock</button>
              <button className={ghost} onClick={() => dnsAction('unblock', dnsLink.username)}>Unblock</button>
            </div>}
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
