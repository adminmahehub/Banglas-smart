'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export type StorePlan = { label: string; price: string; note?: string; hot?: boolean };

export const DEFAULT_PLANS: StorePlan[] = [
  { label: '1 Month', price: '৳1,000', note: '1 device • bKash, Nagad unblocked' },
  { label: '2 Months', price: '৳1,800', note: 'Save ৳200' },
  { label: '3 Months', price: '৳2,500', note: 'Save ৳500', hot: true },
  { label: '6 Months', price: '৳4,900', note: 'Save ৳1,100' },
  { label: '1 Year', price: '৳9,500', note: 'Best value' },
];

export function parsePlans(raw?: string): StorePlan[] {
  try {
    const a = JSON.parse(raw || '');
    if (Array.isArray(a) && a.length) {
      return a.filter((p) => p && p.label && p.price).slice(0, 8).map((p) => ({ label: String(p.label), price: String(p.price), note: p.note ? String(p.note) : '', hot: !!p.hot }));
    }
  } catch { /* use defaults */ }
  return DEFAULT_PLANS;
}

type Props = { theme: 'dark' | 'light'; site: Record<string, string>; onCreate: () => void; onReseller: () => void; onCustomer: () => void };

const BRANDS = ['bKash', 'Nagad', 'Rocket', 'Upay', 'Alaap', 'Brilliant', 'WhatsApp Calling'];

export function StoreHome({ theme, site, onCreate, onReseller, onCustomer }: Props) {
  const dark = theme === 'dark';
  const plans = parsePlans(site.store_plans);
  const wa = site.support_whatsapp_bd || '8801614082537';
  const headline = site.store_headline || 'Fast • Secure • Private Smart DNS';
  const subline = site.store_subline || 'Use bKash, Nagad, Rocket and WhatsApp Calling from abroad at home speed. No VPN app needed.';
  const note = site.store_note || '';
  const box = dark ? 'bg-[#0f172f] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm';
  const mut = dark ? 'text-slate-400' : 'text-slate-600';
  return (
    <div className="pb-24">
      <section className="px-4 pt-14 pb-12 text-center">
        <div className="mx-auto max-w-3xl space-y-5">
          <h1 className={`text-3xl font-black leading-tight tracking-tight sm:text-5xl ${dark ? 'text-white' : 'text-slate-900'}`}>{headline}</h1>
          <p className={`mx-auto max-w-2xl text-sm sm:text-base ${mut}`}>{subline}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {BRANDS.map((b) => (<span key={b} className={`rounded-full border px-3 py-1 text-xs font-bold ${dark ? 'border-slate-700 bg-slate-900 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>✓ {b}</span>))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button onClick={onCustomer} className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-7 py-3 text-sm font-black text-slate-950 shadow-xl shadow-emerald-500/25 hover:scale-105 transition">Get free trial</button>
            <a href="#rates" className={`rounded-2xl border px-7 py-3 text-sm font-black ${dark ? 'border-slate-700 text-white' : 'border-slate-300 text-slate-900'}`}>See rates</a>
          </div>
        </div>
      </section>

      <section id="rates" className="mx-auto max-w-6xl px-4 py-8">
        <h2 className={`mb-6 text-center text-2xl font-black sm:text-3xl ${dark ? 'text-white' : 'text-slate-900'}`}>Package rates</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p, i) => (
            <div key={i} className={`relative flex flex-col justify-between gap-4 rounded-3xl border p-6 ${p.hot ? (dark ? 'border-2 border-cyan-400/80 bg-gradient-to-b from-[#16234b] to-[#0c142b] text-white' : 'border-2 border-cyan-500 bg-cyan-50 text-slate-900') : box}`}>
              {p.hot && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-950">★ Most popular</span>}
              <div className="space-y-1.5">
                <div className={`text-xs font-bold ${mut}`}>{p.label}</div>
                <div className="font-mono text-3xl font-black text-emerald-500">{p.price}</div>
                {p.note && <div className={`text-[11px] ${mut}`}>{p.note}</div>}
              </div>
              <a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hello, I want the ${p.label} plan (${p.price}).`)}`} target="_blank" rel="noreferrer"
                className="rounded-xl bg-[#25D366] px-4 py-2.5 text-center text-xs font-black text-white hover:bg-[#20ba5a]">Order on WhatsApp</a>
            </div>
          ))}
        </div>
        {note && <p className={`mt-5 text-center text-xs ${mut}`}>{note}</p>}
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8">
        <div className={`rounded-3xl border p-6 text-center ${box}`}>
          <h3 className="text-lg font-black">Already a customer?</h3>
          <p className={`mt-1 text-sm ${mut}`}>Open your page with the link your seller sent you, or log in with your link.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button onClick={onCustomer} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white hover:bg-blue-500">Customer login</button>
            <button onClick={onCreate} className={`rounded-xl border px-5 py-2.5 text-sm font-black ${dark ? 'border-slate-700' : 'border-slate-300'}`}>Create account</button>
            <button onClick={onReseller} className={`rounded-xl border px-5 py-2.5 text-sm font-black ${dark ? 'border-amber-500/50 text-amber-300' : 'border-amber-400 text-amber-700'}`}>I am a reseller</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export function AccountChoose({ theme, onReseller, onCustomer }: { theme: 'dark' | 'light'; onReseller: () => void; onCustomer: () => void }) {
  const dark = theme === 'dark';
  const box = dark ? 'bg-[#0f172f] border-slate-800 text-slate-100 hover:border-cyan-400' : 'bg-white border-slate-200 text-slate-900 shadow-sm hover:border-cyan-500';
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h2 className={`mb-2 text-center text-3xl font-black ${dark ? 'text-white' : 'text-slate-900'}`}>Create an account</h2>
      <p className={`mb-8 text-center text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Choose the type of account you need.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <button onClick={onCustomer} className={`rounded-3xl border-2 p-7 text-left transition ${box}`}>
          <div className="text-3xl">👤</div>
          <div className="mt-3 text-xl font-black">Customer account</div>
          <div className="mt-1 text-sm opacity-70">For using Smart DNS yourself. Start with a free trial.</div>
        </button>
        <button onClick={onReseller} className={`rounded-3xl border-2 p-7 text-left transition ${box}`}>
          <div className="text-3xl">🏪</div>
          <div className="mt-3 text-xl font-black">Reseller account</div>
          <div className="mt-1 text-sm opacity-70">Buy credits and sell to your own customers.</div>
        </button>
      </div>
    </div>
  );
}

export function CustomerAccess({ theme, onBack }: { theme: 'dark' | 'light'; onBack: () => void }) {
  const dark = theme === 'dark';
  const [tab, setTab] = useState<'new' | 'link'>('new');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState('');
  const box = dark ? 'bg-[#0f172f] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm';
  const inp = `w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none ${dark ? 'border-slate-700 bg-[#070b18] text-white' : 'border-slate-300 bg-white text-slate-900'}`;

  async function start() {
    setErr('');
    const ph = phone.replace(/[\s()+-]/g, '');
    if (name.trim().length < 2) return setErr('Please enter your name');
    if (!/^[1-9][0-9]{7,14}$/.test(ph)) return setErr('Enter country code and number together, without +. Example: 966501234567 (Saudi), 8801712345678 (Bangladesh), 60123456789 (Malaysia)');
    setBusy(true);
    const { data, error } = await supabase.rpc('public_free_trial', { p_name: name.trim(), p_phone: ph });
    setBusy(false);
    if (error || !data?.token) return setErr(error?.message || 'Could not create the trial. Please try again.');
    setDone(`${window.location.origin}/c/?t=${data.token}`);
  }
  function openLink() {
    setErr('');
    const v = link.trim();
    let t = '';
    try { t = new URL(v).searchParams.get('t') || ''; } catch { /* not a URL */ }
    if (!t) { const m = v.match(/[?&]t=([^&\s]+)/); t = m ? decodeURIComponent(m[1]) : (/^[A-Za-z0-9_-]{8,}$/.test(v) ? v : ''); }
    if (!t) return setErr('Paste the full link your seller sent you.');
    window.location.href = `/c/?t=${encodeURIComponent(t)}`;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <button onClick={onBack} className={`mb-4 text-xs font-bold ${dark ? 'text-slate-400' : 'text-slate-600'}`}>← Back</button>
      <div className={`rounded-3xl border p-6 ${box}`}>
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-black/10 p-1 text-xs font-black">
          <button onClick={() => { setTab('new'); setErr(''); }} className={`rounded-lg py-2 ${tab === 'new' ? 'bg-emerald-500 text-slate-950' : ''}`}>New customer</button>
          <button onClick={() => { setTab('link'); setErr(''); }} className={`rounded-lg py-2 ${tab === 'link' ? 'bg-emerald-500 text-slate-950' : ''}`}>I have my link</button>
        </div>
        {tab === 'new' && !done && (
          <div className="space-y-3">
            <h3 className="text-lg font-black">Free trial account</h3>
            <input className={inp} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className={inp} inputMode="tel" placeholder="WhatsApp number with country code, no +" value={phone} onChange={(e) => setPhone(e.target.value)} />
            {err && <div className="text-xs font-bold text-rose-500">{err}</div>}
            <button disabled={busy} onClick={start} className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-black text-slate-950 disabled:opacity-60">{busy ? 'Please wait…' : 'Create my account'}</button>
          </div>
        )}
        {tab === 'new' && done && (
          <div className="space-y-3 text-center">
            <div className="text-3xl">✅</div>
            <h3 className="text-lg font-black">Your account is ready</h3>
            <p className="text-xs opacity-70">Save this link. It is your login. Do not share it.</p>
            <input readOnly className={inp} value={done} onFocus={(e) => e.currentTarget.select()} />
            <a href={done} className="block w-full rounded-xl bg-blue-600 py-3 text-sm font-black text-white">Open my page</a>
          </div>
        )}
        {tab === 'link' && (
          <div className="space-y-3">
            <h3 className="text-lg font-black">Customer login</h3>
            <input className={inp} placeholder="Paste your link here" value={link} onChange={(e) => setLink(e.target.value)} />
            {err && <div className="text-xs font-bold text-rose-500">{err}</div>}
            <button onClick={openLink} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-black text-white">Open my page</button>
          </div>
        )}
      </div>
    </div>
  );
}
