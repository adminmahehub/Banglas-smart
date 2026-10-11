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

const SF_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Hind+Siliguri:wght@400;500;600;700&display=swap');
.sf{--bg:#061a17;--panel:#0c2823;--panel2:#103630;--line:rgba(236,244,238,.12);--tx:#eef4ee;--mut:#9db4ab;--sun:#f2495c;--sunh:#ff6577;--jade:#2fd18f;
 background:radial-gradient(1200px 600px at 78% -10%,rgba(47,209,143,.16),transparent 60%),radial-gradient(800px 500px at 0% 30%,rgba(242,73,92,.09),transparent 60%),var(--bg);
 color:var(--tx);font-family:'Hind Siliguri',system-ui,sans-serif;overflow:hidden}
.sf *{box-sizing:border-box}
.sf .disp{font-family:'Bricolage Grotesque','Hind Siliguri',system-ui,sans-serif;letter-spacing:-.025em}
.sf .wrap{max-width:1120px;margin:0 auto;padding:0 20px}
.sf a:focus-visible,.sf button:focus-visible,.sf summary:focus-visible{outline:2px solid var(--jade);outline-offset:3px;border-radius:12px}
.sf .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:14px;padding:14px 26px;font-weight:700;font-size:15px;cursor:pointer;border:0;transition:transform .2s,background .2s,box-shadow .2s;text-decoration:none}
.sf .btn-sun{background:var(--sun);color:#fff;box-shadow:0 10px 30px -8px rgba(242,73,92,.65)}
.sf .btn-sun:hover{background:var(--sunh);transform:translateY(-2px)}
.sf .btn-ghost{background:transparent;color:var(--tx);border:1px solid var(--line)}
.sf .btn-ghost:hover{background:rgba(255,255,255,.06)}
/* hero load sequence: the only entrance animation on the page */
.sf .h-in{opacity:0;transform:translateY(18px);animation:sfIn .8s cubic-bezier(.2,.7,.2,1) forwards}
.sf .h-in:nth-child(2){animation-delay:.12s}.sf .h-in:nth-child(3){animation-delay:.24s}.sf .h-in:nth-child(4){animation-delay:.36s}
@keyframes sfIn{to{opacity:1;transform:none}}
.sf .route{stroke-dasharray:3 7;animation:sfDash 2.4s linear infinite}
@keyframes sfDash{to{stroke-dashoffset:-20}}
.sf .pulse{transform-box:fill-box;transform-origin:center;animation:sfPulse 2.2s ease-out infinite}
@keyframes sfPulse{0%{transform:scale(.6);opacity:.9}100%{transform:scale(3.2);opacity:0}}
.sf .card{background:linear-gradient(180deg,var(--panel2),var(--panel));border:1px solid var(--line);border-radius:22px}
.sf .plan{position:relative;display:flex;flex-direction:column;justify-content:space-between;gap:22px;padding:26px;border-radius:22px;background:var(--panel);border:1px solid var(--line);transition:transform .25s,border-color .25s}
.sf .plan:hover{transform:translateY(-4px);border-color:rgba(47,209,143,.5)}
.sf .plan.hot{background:linear-gradient(180deg,#14443b,#0c2823);border-color:var(--jade);box-shadow:0 20px 60px -20px rgba(47,209,143,.45)}
.sf details{border-bottom:1px solid var(--line)}
.sf summary{cursor:pointer;list-style:none;padding:20px 0;font-weight:600;font-size:17px;display:flex;justify-content:space-between;gap:16px}
.sf summary::-webkit-details-marker{display:none}
.sf summary::after{content:'+';color:var(--jade);font-size:24px;line-height:1;transition:transform .25s}
.sf details[open] summary::after{transform:rotate(45deg)}
.sf details p{margin:0 0 20px;color:var(--mut);line-height:1.7;max-width:62ch}
.sf .tick{animation:sfTick .45s ease}
@keyframes sfTick{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.sf *{animation:none!important;transition:none!important}.sf .h-in{opacity:1;transform:none}}
`;

function Route() {
  // Riyadh, Dubai and Kuala Lumpur to Dhaka, positioned from real latitude/longitude
  const dhaka = { x: 415, y: 114 };
  const from = [
    { n: 'Riyadh', x: 90, y: 118, c: 'M90 118 Q250 10 415 114', lx: 90, ly: 142 },
    { n: 'Dubai', x: 160, y: 96, c: 'M160 96 Q280 150 415 114', lx: 160, ly: 80 },
    { n: 'Kuala Lumpur', x: 498, y: 293, c: 'M498 293 Q500 190 415 114', lx: 498, ly: 318 },
  ];
  return (
    <svg viewBox="0 0 600 340" role="img" aria-label="Connections from Riyadh, Dubai and Kuala Lumpur to the Dhaka server" style={{ width: '100%', height: 'auto' }}>
      <defs>
        <pattern id="sfdots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="rgba(236,244,238,.14)" /></pattern>
        <radialGradient id="sffade"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#000" /></radialGradient>
        <mask id="sfmask"><rect width="600" height="340" fill="url(#sffade)" /></mask>
      </defs>
      <rect width="600" height="340" fill="url(#sfdots)" mask="url(#sfmask)" />
      {from.map((f, i) => (
        <g key={f.n}>
          <path id={`sfp${i}`} d={f.c} className="route" fill="none" stroke="rgba(47,209,143,.55)" strokeWidth="1.6" />
          <circle r="4" fill="#2fd18f"><animateMotion dur={`${3.6 + i * 0.7}s`} begin={`${i * 0.9}s`} repeatCount="indefinite"><mpath href={`#sfp${i}`} /></animateMotion></circle>
          <circle cx={f.x} cy={f.y} r="5" fill="#eef4ee" />
          <text x={f.lx} y={f.ly} textAnchor="middle" fill="#9db4ab" fontSize="16" fontFamily="Hind Siliguri, sans-serif">{f.n}</text>
        </g>
      ))}
      <circle className="pulse" cx={dhaka.x} cy={dhaka.y} r="8" fill="#f2495c" />
      <circle cx={dhaka.x} cy={dhaka.y} r="8" fill="#f2495c" />
      <text x={dhaka.x} y={dhaka.y + 28} textAnchor="middle" fill="#eef4ee" fontSize="18" fontWeight="700" fontFamily="Hind Siliguri, sans-serif">Dhaka</text>
    </svg>
  );
}

const STEPS = [
  { t: 'Start your free trial', d: 'Enter your name and WhatsApp number. Your personal link is ready in seconds.' },
  { t: 'Install the DNS setting', d: 'Open your link and follow the short steps for iPhone or Android. It takes about two minutes.' },
  { t: 'Use your apps as usual', d: 'Open bKash, Nagad or WhatsApp. They see a connection from Bangladesh.' },
];
const WHY = [
  { t: 'No VPN app', d: 'A small DNS setting on your phone. Nothing running in the background, no battery drain.' },
  { t: 'One account, one network', d: 'Your account is locked to your own network, so a shared login cannot be passed around.' },
  { t: 'Servers in Dhaka', d: 'Bank and wallet requests are answered from Bangladesh.' },
  { t: 'Help on WhatsApp', d: 'Real people answer in Bangla and English from Bangladesh and Malaysia.' },
];
const FAQ = [
  ['Do I need a VPN app?', 'No. You install a DNS setting once. On iPhone you install a profile. On Android your personal page shows the exact steps.'],
  ['Which apps does it work with?', 'bKash, Nagad, Rocket, Upay, Alaap, Brilliant and WhatsApp calling.'],
  ['Can I use one account on two phones?', 'Each account is locked to one network. If you move to a new Wi-Fi or country, ask your seller to unlock it.'],
  ['How do I pay?', 'Choose a rate and tap Order on WhatsApp. You pay by bKash or Nagad, and your account is activated after payment.'],
  ['Is there a free trial?', 'Yes. Create a customer account and try it before you pay.'],
];

export function StoreHome({ site, onCreate, onReseller, onCustomer }: Props) {
  const plans = parsePlans(site.store_plans);
  const wa = site.support_whatsapp_bd || '8801614082537';
  const waMy = site.support_whatsapp_my || '60173103546';
  const headline = site.store_headline || '';
  const subline = site.store_subline || 'Use bKash, Nagad, Rocket and WhatsApp calling from abroad, with no VPN app. Made for Bangladeshis in Saudi Arabia, Malaysia and the Gulf.';
  const note = site.store_note || '';
  const [i, setI] = useState(0);
  React.useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % 2), 3200); return () => clearInterval(t); }, []);
  const on = i === 1;
  return (
    <div className="sf">
      <style dangerouslySetInnerHTML={{ __html: SF_CSS }} />

      <section className="wrap" style={{ display: 'grid', gap: 40, padding: '64px 20px 56px', alignItems: 'center', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
        <div>
          <p className="h-in" style={{ color: 'var(--jade)', fontWeight: 600, margin: '0 0 14px', fontSize: 16 }}>বিদেশে থেকেও দেশের মতো</p>
          <h1 className="h-in disp" style={{ fontSize: 'clamp(34px,5vw,60px)', lineHeight: 1.02, fontWeight: 700, margin: 0 }}>
            {headline || <>bKash and Nagad, <br />from anywhere you live.</>}
          </h1>
          <p className="h-in" style={{ color: 'var(--mut)', fontSize: 18, lineHeight: 1.65, maxWidth: '46ch', margin: '22px 0 30px' }}>{subline}</p>
          <div className="h-in" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button className="btn btn-sun" onClick={onCustomer}>Start free trial</button>
            <a className="btn btn-ghost" href="#rates">See rates</a>
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <Route />
          <div style={{ marginTop: 6, background: '#061a17', border: '1px solid var(--line)', borderRadius: 16, padding: '14px 16px', minHeight: 74 }}>
            <div key={i} className="tick" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 18, background: on ? 'rgba(47,209,143,.16)' : 'rgba(242,73,92,.16)', color: on ? 'var(--jade)' : 'var(--sun)' }}>{on ? '✓' : '✕'}</span>
              <span>
                <b style={{ display: 'block', fontSize: 16 }}>{on ? 'With MaheHub DNS' : 'Without it, abroad'}</b>
                <span style={{ color: 'var(--mut)', fontSize: 14 }}>{on ? 'bKash login works. OTP arrives.' : 'bKash says it cannot connect.'}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ padding: '8px 20px 24px', display: 'flex', flexWrap: 'wrap', gap: '10px 28px', color: 'var(--mut)', fontWeight: 600 }}>
        {['bKash', 'Nagad', 'Rocket', 'Upay', 'Alaap', 'Brilliant', 'WhatsApp calling'].map((b) => (<span key={b}><span style={{ color: 'var(--jade)' }}>✓ </span>{b}</span>))}
      </section>

      <section className="wrap" style={{ padding: '72px 20px 24px' }}>
        <h2 className="disp" style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, margin: '0 0 36px', maxWidth: 560 }}>Working in three steps</h2>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))' }}>
          {STEPS.map((s, k) => (
            <li key={s.t} className="card" style={{ padding: 26 }}>
              <div className="disp" style={{ fontSize: 44, fontWeight: 700, color: k === 2 ? 'var(--sun)' : 'var(--jade)', lineHeight: 1 }}>{k + 1}</div>
              <h3 style={{ margin: '14px 0 8px', fontSize: 20, fontWeight: 700 }}>{s.t}</h3>
              <p style={{ margin: 0, color: 'var(--mut)', lineHeight: 1.65 }}>{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap" style={{ padding: '56px 20px 24px', display: 'grid', gap: 40, gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
        <h2 className="disp" style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, margin: 0, lineHeight: 1.1 }}>Built for people who send money home</h2>
        <div style={{ display: 'grid', gap: 22 }}>
          {WHY.map((w) => (
            <div key={w.t} style={{ borderLeft: '2px solid var(--jade)', paddingLeft: 18 }}>
              <b style={{ fontSize: 18 }}>{w.t}</b>
              <p style={{ margin: '4px 0 0', color: 'var(--mut)', lineHeight: 1.65 }}>{w.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="rates" className="wrap" style={{ padding: '72px 20px 24px' }}>
        <h2 className="disp" style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, margin: '0 0 8px' }}>Rates</h2>
        <p style={{ color: 'var(--mut)', margin: '0 0 36px' }}>Pick a plan and order on WhatsApp. Your account is activated after payment.</p>
        <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
          {plans.map((p, k) => (
            <div key={k} className={`plan${p.hot ? ' hot' : ''}`}>
              {p.hot && <span style={{ position: 'absolute', top: -12, left: 22, background: 'var(--sun)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99 }}>Most popular</span>}
              <div>
                <div style={{ color: 'var(--mut)', fontWeight: 600 }}>{p.label}</div>
                <div className="disp" style={{ fontSize: 44, fontWeight: 700, margin: '6px 0', lineHeight: 1.05 }}>{p.price}</div>
                {p.note && <div style={{ color: p.hot ? 'var(--jade)' : 'var(--mut)', fontSize: 14 }}>{p.note}</div>}
              </div>
              <a className={`btn ${p.hot ? 'btn-sun' : 'btn-ghost'}`} href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hello, I want the ${p.label} plan (${p.price}).`)}`} target="_blank" rel="noreferrer">Order on WhatsApp</a>
            </div>
          ))}
        </div>
        {note && <p style={{ color: 'var(--mut)', marginTop: 22, fontSize: 14 }}>{note}</p>}
      </section>

      <section className="wrap" style={{ padding: '72px 20px 24px', maxWidth: 820 }}>
        <h2 className="disp" style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, margin: '0 0 12px' }}>Questions</h2>
        {FAQ.map(([q, a]) => (<details key={q}><summary>{q}</summary><p>{a}</p></details>))}
      </section>

      <section className="wrap" style={{ padding: '80px 20px 96px' }}>
        <div className="card" style={{ padding: 'clamp(28px,5vw,56px)', display: 'grid', gap: 28, gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', alignItems: 'center', background: 'linear-gradient(120deg,#14443b,#0c2823 60%,#2a1a20)' }}>
          <div>
            <h2 className="disp" style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700, margin: '0 0 10px', lineHeight: 1.1 }}>Try it before you pay</h2>
            <p style={{ color: 'var(--mut)', margin: 0, lineHeight: 1.65 }}>Create a customer account, set it up in two minutes and check bKash yourself.</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-start' }}>
            <button className="btn btn-sun" onClick={onCustomer}>Start free trial</button>
            <button className="btn btn-ghost" onClick={onCreate}>Create account</button>
            <a className="btn btn-ghost" href={`https://wa.me/${waMy}`} target="_blank" rel="noreferrer">WhatsApp us</a>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: 28, color: 'var(--mut)', fontSize: 14 }}>
          Sell MaheHub to your own customers? <button onClick={onReseller} style={{ background: 'none', border: 0, color: 'var(--tx)', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', fontSize: 14 }}>Become a reseller</button>
        </p>
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

export function AccountTypeSelect({ value, onChange, className }: { value: 'reseller' | 'customer'; onChange: (v: 'reseller' | 'customer') => void; className: string }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1 block text-[11px] font-bold opacity-70">Account type</span>
      <select value={value} onChange={(e) => onChange(e.target.value as 'reseller' | 'customer')} className={className}>
        <option value="customer">Customer account (use Smart DNS, free trial)</option>
        <option value="reseller">Reseller account (sell DNS, wholesale rates)</option>
      </select>
    </label>
  );
}

// Phone numbers pasted from WhatsApp often carry invisible marks or Bengali/Arabic digits. Keep digits 0-9 only.
export function cleanPhone(v: string): string {
  let out = '';
  for (const ch of String(v || '')) {
    const c = ch.codePointAt(0) || 0;
    if (c >= 0x09e6 && c <= 0x09ef) out += String(c - 0x09e6);        // Bengali digits
    else if (c >= 0x0660 && c <= 0x0669) out += String(c - 0x0660);   // Arabic-Indic digits
    else if (c >= 0x06f0 && c <= 0x06f9) out += String(c - 0x06f0);   // Persian digits
    else if (c >= 0xff10 && c <= 0xff19) out += String(c - 0xff10);   // full-width digits
    else if (c >= 0x30 && c <= 0x39) out += ch;
  }
  return out.replace(/^00+/, '');
}

const PANEL_LIGHT = { '--bg': '#f4f6fb', '--card': '#ffffff', '--ink': '#1b2140', '--mut': '#7b83a6', '--line': '#e6e9f4', '--soft': '#eef1fb' } as React.CSSProperties;
const pCard = 'rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-[0_8px_30px_rgba(60,72,140,0.07)]';
const pInp = 'w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-indigo-400';
const pPrimary = 'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 active:scale-95 disabled:opacity-60';

export function CustomerAccess({ onBack, onAccountType }: { theme?: 'dark' | 'light'; onBack: () => void; onAccountType?: (v: 'reseller' | 'customer') => void }) {
  const [tab, setTab] = useState<'new' | 'link'>('new');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState('');
  const [doneCode, setDoneCode] = useState('');

  async function start() {
    setErr('');
    const ph = cleanPhone(phone);
    if (name.trim().length < 2) return setErr('Please enter your name');
    if (!/^[1-9][0-9]{7,14}$/.test(ph)) return setErr('Enter country code and number together, without +. Example: 966501234567 (Saudi), 8801712345678 (Bangladesh), 60123456789 (Malaysia)');
    setBusy(true);
    const { data, error } = await supabase.rpc('public_free_trial', { p_name: name.trim(), p_phone: ph });
    setBusy(false);
    if (error || !data?.token) return setErr(error?.message || 'Could not create the trial. Please try again.');
    setDone(`${window.location.origin}/c/?t=${data.token}`);
    setDoneCode(data.code || '');
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
    <div style={PANEL_LIGHT} className="min-h-screen grid place-items-center bg-[var(--bg)] p-4 text-[var(--ink)]">
      <div className={`${pCard} w-full max-w-sm p-7`}>
        <div className="mb-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white grid place-items-center font-black">M</div>
          <div><div className="font-black">MAHEHUB</div><div className="text-[10px] font-bold text-indigo-500 tracking-widest">CUSTOMER ACCOUNT</div></div>
        </div>
        {onAccountType && <AccountTypeSelect value="customer" onChange={onAccountType} className={pInp} />}
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-[var(--soft)] p-1 text-xs font-black">
          <button onClick={() => { setTab('new'); setErr(''); }} className={`rounded-lg py-2 ${tab === 'new' ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow' : 'text-[var(--mut)]'}`}>New customer</button>
          <button onClick={() => { setTab('link'); setErr(''); }} className={`rounded-lg py-2 ${tab === 'link' ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow' : 'text-[var(--mut)]'}`}>I have my link</button>
        </div>
        {tab === 'new' && !done && (
          <div className="space-y-3">
            <h3 className="text-lg font-black">Free trial account</h3>
            <input className={pInp} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className={pInp} inputMode="tel" placeholder="WhatsApp number with country code, no +" value={phone} onChange={(e) => setPhone(e.target.value)} />
            {err && <div className="text-xs font-semibold text-rose-500">{err}</div>}
            <button disabled={busy} onClick={start} className={pPrimary}>{busy ? 'Please wait…' : 'Create my account'}</button>
          </div>
        )}
        {tab === 'new' && done && (
          <div className="space-y-3 text-center">
            <div className="text-3xl">✅</div>
            <h3 className="text-lg font-black">Your account is ready</h3>
            {doneCode && (
              <div className="rounded-xl bg-[var(--soft)] px-4 py-3">
                <div className="text-[11px] text-[var(--mut)]">Your customer ID</div>
                <div className="select-all font-mono text-3xl font-black tracking-[0.25em] text-indigo-600">{doneCode}</div>
                <div className="mt-1 text-[11px] text-[var(--mut)]">Send this ID to a seller on WhatsApp to activate your subscription.</div>
              </div>
            )}
            <p className="text-xs text-[var(--mut)]">Save this link. It is your login. Do not share it.</p>
            <input readOnly className={pInp} value={done} onFocus={(e) => e.currentTarget.select()} />
            <a href={done} className={pPrimary}>Open my page</a>
          </div>
        )}
        {tab === 'link' && (
          <div className="space-y-3">
            <h3 className="text-lg font-black">Customer login</h3>
            <input className={pInp} placeholder="Paste your link here" value={link} onChange={(e) => setLink(e.target.value)} />
            {err && <div className="text-xs font-semibold text-rose-500">{err}</div>}
            <button onClick={openLink} className={pPrimary}>Open my page</button>
          </div>
        )}
        <button className="mt-3 w-full text-xs text-[var(--mut)]" onClick={onBack}>← Back to store</button>
      </div>
    </div>
  );
}
