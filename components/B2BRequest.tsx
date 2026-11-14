'use client';
const FN_URL = 'https://ssaqdsqopxclkplstpzj.supabase.co/functions/v1/b2b-api';
import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Website: "Request white-label / API access" form
export function B2BRequestForm({ dark, waNumber }: { dark: boolean; waNumber: string }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: '', whatsapp: '', website: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(false);
  const inp = `w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-cyan-400 ${dark ? 'bg-[#0a122e] border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900'}`;
  async function send() {
    setMsg(''); setBusy(true);
    const { error } = await supabase.rpc('submit_b2b_request', { p_name: f.name, p_whatsapp: f.whatsapp, p_website: f.website, p_message: f.message });
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    setDone(true);
  }
  if (done) return <div className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-500">Request received. We will contact you on WhatsApp after approval.</div>;
  return (
    <div className="mt-6">
      {!open ? (
        <button onClick={() => setOpen(true)} className="rounded-2xl border border-cyan-500/50 px-5 py-3 text-xs font-black text-cyan-400 transition hover:bg-cyan-500/10">Request White-Label / API access</button>
      ) : (
        <div className={`space-y-3 rounded-2xl border p-5 ${dark ? 'border-slate-800 bg-[#070e24]' : 'border-slate-200 bg-slate-50'}`}>
          <div className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-900'}`}>White-Label / API access request</div>
          <input className={inp} placeholder="Your name / company" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input className={inp} inputMode="tel" placeholder="WhatsApp number with country code" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} />
          <input className={inp} placeholder="Your website (optional)" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
          <textarea className={inp} rows={3} placeholder="Tell us what you need (optional)" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
          {msg && <div className="text-xs font-bold text-rose-500">{msg}</div>}
          <div className="flex flex-wrap gap-2">
            <button disabled={busy} onClick={send} className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-black text-slate-950 disabled:opacity-60">{busy ? 'Sending…' : 'Send request'}</button>
            <button onClick={() => setOpen(false)} className={`rounded-xl border px-5 py-2.5 text-xs font-bold ${dark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-600'}`}>Cancel</button>
            <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Hello MaheHub, I want White-Label / API access.')}`} target="_blank" rel="noreferrer" className="rounded-xl bg-[#25D366] px-5 py-2.5 text-xs font-black text-white">WhatsApp instead</a>
          </div>
        </div>
      )}
    </div>
  );
}

// Website: API documentation
export function B2BDocs({ dark }: { dark: boolean }) {
  const [open, setOpen] = useState(false);
  const code = `curl -X POST ${FN_URL} \\
  -H "x-api-key: YOUR_API_KEY" -H "content-type: application/json" \\
  -d '{"action":"create_customer","phone":"8801XXXXXXXXX","months":1}'`;
  const box = `rounded-xl p-3 text-[11px] leading-relaxed overflow-x-auto whitespace-pre ${dark ? 'bg-[#050a1c] text-cyan-200' : 'bg-slate-100 text-slate-800'}`;
  return (
    <div className="mt-4">
      <button onClick={() => setOpen(!open)} className="text-xs font-bold text-cyan-400 underline">{open ? 'Hide' : 'Show'} API documentation</button>
      {open && (
        <div className={`mt-3 space-y-3 text-xs ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
          <p>Approved partners get an API key from MaheHub. Each customer you create costs 1 credit per month from your reseller balance. Send the key in the <b>x-api-key</b> header. All calls are <b>POST</b> with a JSON body.</p>
          <div className="font-black">Endpoint</div>
          <div className={box}>{FN_URL}</div>
          <div className="font-black">1. Create a customer</div>
          <div className={box}>{code}</div>
          <div className={box}>{`{ "ok": true,
  "customer": { "phone": "8801...", "customer_id": "123456",
                "expiry": "2026-12-14", "setup_link": "https://smartdns.mahehub.com/c/?t=..." },
  "credits_left": 41 }`}</div>
          <p>Send <b>setup_link</b> to your customer. It opens their setup page (hostname, iPhone profile, activation).</p>
          <div className="font-black">2. Balance</div>
          <div className={box}>{`{"action":"balance"}  ->  {"ok":true,"credits":42}`}</div>
          <div className="font-black">3. Customer status</div>
          <div className={box}>{`{"action":"status","phone":"8801XXXXXXXXX"}  ->  {"ok":true,"customer":{"status":"active","expiry":"..."}}`}</div>
          <div className="font-black">Errors</div>
          <div className={box}>{`401 invalid_api_key · 400 invalid_phone / invalid_months (1-12) / already_exists
402 insufficient_credits · 404 not_found`}</div>
        </div>
      )}
    </div>
  );
}

// Admin panel: list + approve / reject
export function B2BKeysCard({ cls }: { cls: { card: string; primary: string; ghost: string } }) {
  const [resellers, setResellers] = useState<any[]>([]);
  const [keys, setKeys] = useState<Record<string, any>>({});
  const [shown, setShown] = useState<{ name: string; key: string } | null>(null);
  const load = useCallback(async () => {
    const [p, k] = await Promise.all([
      supabase.from('profiles').select('id,name,whatsapp,credits,role').neq('role', 'admin').order('name'),
      supabase.from('b2b_keys').select('partner_id,prefix,active,created_at,last_used_at'),
    ]);
    setResellers(p.data || []);
    const m: Record<string, any> = {};
    (k.data || []).forEach((x: any) => { m[x.partner_id] = x; });
    setKeys(m);
  }, []);
  useEffect(() => { load(); }, [load]);
  async function gen(r: any) {
    if (!confirm((keys[r.id] ? 'Replace the old API key of ' : 'Create an API key for ') + (r.name || 'this reseller') + '?')) return;
    const { data, error } = await supabase.rpc('admin_b2b_new_key', { p_partner: r.id });
    if (error || !data) { alert(error?.message || 'Failed'); return; }
    setShown({ name: r.name || 'Partner', key: String(data) }); load();
  }
  async function revoke(r: any) {
    if (!confirm('Revoke the API key of ' + (r.name || 'this reseller') + '?')) return;
    const { error } = await supabase.rpc('admin_b2b_revoke', { p_partner: r.id });
    if (error) alert(error.message); else load();
  }
  return (
    <div className={`${cls.card} p-4 mb-5`}>
      <div className="mb-1 text-sm font-black text-cyan-500">White-label / B2B API partners</div>
      <p className="mb-3 text-xs text-[var(--mut)]">A partner is a reseller with an API key. Customers created through the API use that reseller's credits. Add credits to the reseller as usual.</p>
      {shown && (
        <div className="mb-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs">
          <div className="font-black text-emerald-500">API key for {shown.name} (shown only once, copy it now)</div>
          <div className="mt-1 break-all rounded-lg bg-[var(--card)] p-2 font-mono">{shown.key}</div>
          <div className="mt-2 flex gap-2"><button className={`${cls.primary} !px-3 !py-1.5 text-xs`} onClick={() => { try { navigator.clipboard.writeText(shown.key); } catch { /* ignore */ } }}>Copy</button><button className={`${cls.ghost} !px-3 !py-1.5 text-xs`} onClick={() => setShown(null)}>Done</button></div>
        </div>
      )}
      <div className="space-y-2">
        {resellers.map((r) => { const k = keys[r.id]; return (
          <div key={r.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 py-2 text-sm">
            <div className="min-w-0 flex-1"><div className="truncate font-black">{r.name || 'Reseller'}</div><div className="text-xs text-[var(--mut)]">{r.credits} credits{k ? ` · key ${k.prefix}… ${k.active ? 'active' : 'revoked'}${k.last_used_at ? ' · used ' + new Date(k.last_used_at).toLocaleDateString() : ''}` : ' · no API key'}</div></div>
            <button className={`${cls.primary} !px-3 !py-1.5 text-xs`} onClick={() => gen(r)}>{k ? 'New key' : 'Create key'}</button>
            {k?.active && <button className={`${cls.ghost} !px-3 !py-1.5 text-xs`} onClick={() => revoke(r)}>Revoke</button>}
          </div>); })}
        {resellers.length === 0 && <div className="text-xs text-[var(--mut)]">No resellers yet.</div>}
      </div>
    </div>
  );
}

export function B2BAdminCard({ cls }: { cls: { card: string; primary: string; ghost: string } }) {
  const [rows, setRows] = useState<any[]>([]);
  const load = useCallback(async () => {
    const { data } = await supabase.from('b2b_requests').select('*').order('created_at', { ascending: false }).limit(50);
    setRows(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);
  async function decide(id: string, ok: boolean) {
    const note = ok ? '' : (prompt('Reason (optional)') || '');
    const { error } = await supabase.rpc('admin_resolve_b2b', { p_id: id, p_approve: ok, p_note: note });
    if (error) alert(error.message); else load();
  }
  const pend = rows.filter((r) => r.status === 'pending');
  if (!rows.length) return null;
  return (
    <div className={`${cls.card} p-4 mb-5 ${pend.length ? 'border-cyan-500/40' : ''}`}>
      <div className="mb-2 text-sm font-black text-cyan-500">White-label / B2B requests {pend.length ? `(${pend.length} pending)` : ''}</div>
      <div className="space-y-2">
        {rows.slice(0, 15).map((r) => (
          <div key={r.id} className="rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 py-2.5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-0 flex-1">
                <div className="truncate font-black">{r.name} · +{r.whatsapp}</div>
                <div className="text-xs text-[var(--mut)] break-words">{r.website ? r.website + ' · ' : ''}{new Date(r.created_at).toLocaleString()}{r.message ? ' · ' + r.message : ''}</div>
              </div>
              <a href={`https://wa.me/${r.whatsapp}`} target="_blank" rel="noreferrer" className={`${cls.ghost} !px-3 !py-1.5 text-xs`}>WhatsApp</a>
              {r.status === 'pending'
                ? <><button className={`${cls.primary} !px-3 !py-1.5 text-xs`} onClick={() => decide(r.id, true)}>Approve</button><button className={`${cls.ghost} !px-3 !py-1.5 text-xs`} onClick={() => decide(r.id, false)}>Reject</button></>
                : <span className={`text-xs font-bold ${r.status === 'approved' ? 'text-emerald-500' : 'text-rose-500'}`}>{r.status}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
