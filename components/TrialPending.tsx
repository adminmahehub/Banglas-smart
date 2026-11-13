'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

type Props = { phone: string; code: string; name?: string; wa: string; dark?: boolean; onToken?: (t: string) => void; onOpen?: (url: string) => void };

/** Free trial waiting for the admin's approval. The customer sends his ID on WhatsApp, then taps "Check status". */
export default function TrialPending({ phone, code, name, wa, dark, onToken, onOpen }: Props) {
  const [state, setState] = useState<'pending' | 'active' | 'used' | 'expired' | 'not_found' | 'too_many'>('pending');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  async function check() {
    setBusy(true);
    const { data } = await supabase.rpc('trial_check', { p_phone: phone, p_code: code });
    setBusy(false);
    const s = (data?.state || 'pending') as typeof state;
    setState(s);
    if (s === 'active' && data?.token && onToken) { if (timer.current) clearInterval(timer.current); onToken(String(data.token)); return; }
    if (s === 'active' && data?.token) {
      setLink(`${window.location.origin}/c/?t=${data.token}`);
      if (timer.current) clearInterval(timer.current);
    }
  }
  useEffect(() => {
    timer.current = setInterval(() => { check(); }, 20000);
    return () => { if (timer.current) clearInterval(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const waUrl = () => `https://wa.me/${wa}?text=${msg}`;
  const msg = encodeURIComponent(`Hello MaheHub, I want a free 1-hour trial.\nMy customer ID: ${code}\nName: ${name || ''}\nNumber: ${phone}`);
  const ink = dark ? 'text-white' : 'text-slate-900';
  const mut = dark ? 'text-slate-400' : 'text-slate-500';
  const copy = async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ } };

  if (state === 'active' && link) {
    return (
      <div className="space-y-3 text-center">
        <div className="rounded-xl bg-emerald-500/15 px-4 py-3 text-sm font-bold text-emerald-500">Approved. Your free trial works for 1 hour.</div>
        <a href={link} className="block w-full rounded-xl bg-emerald-500 py-3 text-sm font-black text-slate-950">Open my setup page</a>
        <button onClick={copy} className="w-full rounded-xl border border-emerald-500/40 py-2.5 text-xs font-bold text-emerald-500">{copied ? 'Link copied!' : 'Copy my personal link (save it)'}</button>
      </div>
    );
  }
  return (
    <div className="space-y-3 text-center">
      <div className="rounded-xl bg-amber-500/15 px-4 py-3 text-sm font-bold text-amber-500">
        {state === 'used' ? 'Your account is approved. Please use your saved link (or the "My link" / "I have my link" tab).' : state === 'expired' ? 'This trial request has ended.' : state === 'not_found' ? 'Request not found.' : state === 'too_many' ? 'Too many checks. Try again in a few minutes.' : 'Request received. Waiting for approval.'}
      </div>
      <div className="rounded-xl border border-amber-500/40 px-4 py-3">
        <div className={`text-[11px] ${mut}`}>Your customer ID</div>
        <div className="select-all font-mono text-3xl font-black tracking-[0.25em] text-amber-500">{code}</div>
      </div>
      <p className={`text-xs leading-relaxed ${mut}`}>Send this ID to us on WhatsApp. After we approve it, tap &ldquo;Check status&rdquo; and your setup link will appear here.</p>
      <a target="_blank" rel="noreferrer" href={waUrl()} onClick={(e) => { if (onOpen) { e.preventDefault(); onOpen(waUrl()); } }} className="block w-full rounded-xl bg-emerald-500 py-3 text-sm font-black text-slate-950">Send ID on WhatsApp</a>
      <button disabled={busy} onClick={check} className={`w-full rounded-xl border py-2.5 text-xs font-bold disabled:opacity-60 ${dark ? 'border-slate-600' : 'border-slate-300'} ${ink}`}>{busy ? 'Checking…' : 'Check status'}</button>
    </div>
  );
}
