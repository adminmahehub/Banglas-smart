'use client';
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

// Admin panel: list + approve / reject
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
