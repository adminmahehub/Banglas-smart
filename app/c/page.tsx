'use client';
import { useEffect, useState } from 'react';

const BASE = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ssaqdsqopxclkplstpzj.supabase.co') + '/functions/v1/dns-portal';

type Info = {
  found: boolean; valid?: boolean; status?: string; blocked?: boolean; phone_hint?: string;
  expiry_date?: string; days_left?: number; bound_ip?: string | null; hostname?: string; activate_url?: string;
};

const card = 'rounded-2xl border border-[#232c52] bg-[#141c38] p-5 mb-4';
const btn = 'inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition active:scale-95';
const primary = `${btn} bg-gradient-to-r from-indigo-500 to-violet-500 text-white`;
const ghost = `${btn} border border-[#232c52] bg-[#1b2547] text-white`;

export default function CustomerPage() {
  const [token, setToken] = useState('');
  const [info, setInfo] = useState<Info | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('t') || '';
    setToken(t);
    if (!t) { setInfo({ found: false }); setLoading(false); return; }
    fetch(`${BASE}?t=${encodeURIComponent(t)}`)
      .then((r) => (r.ok ? r.json() : { found: false }))
      .then((d) => setInfo(d))
      .catch(() => setInfo({ found: false }))
      .finally(() => setLoading(false));
  }, []);

  const copyHost = () => {
    try { navigator.clipboard?.writeText(info?.hostname || ''); } catch { /* ignore */ }
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const activateHref = info?.activate_url ? `${info.activate_url}&r=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}` : '#';

  return (
    <div className="min-h-screen bg-[#0c1226] px-4 py-8 text-[#eef1ff]">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 font-black text-white">M</div>
          <div><div className="font-black">MAHEHUB</div><div className="text-[10px] font-bold tracking-widest text-indigo-400">DNS SERVICE</div></div>
        </div>

        {loading && <div className={card}>Loading…</div>}

        {!loading && !info?.found && (
          <div className={card}>
            <div className="mb-1 font-black">Link not valid</div>
            <p className="text-sm text-[#97a0c8]">This link is invalid or has been replaced. Please contact your seller for a new link.</p>
          </div>
        )}

        {!loading && info?.found && (
          <>
            <div className={card}>
              <div className="flex items-center justify-between">
                <div className="text-sm text-[#97a0c8]">Account •••• {info.phone_hint}</div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${info.valid ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                  {info.blocked ? 'blocked' : info.status}
                </span>
              </div>
              <div className="mt-2 text-sm">Expires: <b>{info.expiry_date}</b> · {info.days_left} day(s) left</div>
              {info.bound_ip
                ? <div className="mt-1 text-xs text-[#97a0c8]">Activated for IP: {info.bound_ip}</div>
                : <div className="mt-1 text-xs text-amber-400">Not activated yet. Press “Activate my IP” below.</div>}
            </div>

            {!info.valid ? (
              <div className={card}>
                <p className="text-sm text-[#97a0c8]">
                  {info.blocked ? 'Your access is blocked. Please contact your seller.' : 'Your subscription is not active. Please contact your seller to renew.'}
                </p>
              </div>
            ) : (
              <>
                <div className={card}>
                  <div className="mb-1 font-black">1. iPhone</div>
                  <p className="mb-3 text-sm text-[#97a0c8]">Open this page in Safari, tap the button, then go to Settings → “Profile Downloaded” → Install.</p>
                  <a className={primary} href={`${BASE}?t=${encodeURIComponent(token)}&download=profile`}>Download Profile</a>
                </div>

                <div className={card}>
                  <div className="mb-1 font-black">2. Android</div>
                  <p className="mb-3 text-sm text-[#97a0c8]">Copy the hostname, then go to Settings → Network &amp; internet → Private DNS → “Private DNS provider hostname”, paste it and save.</p>
                  <button className={ghost} onClick={copyHost}>{copied ? 'Copied!' : 'Copy DNS Hostname'}</button>
                  <div className="mt-2 break-all text-center text-xs text-[#97a0c8]">{info.hostname}</div>
                </div>

                <div className={card}>
                  <div className="mb-1 font-black">3. Activate my IP</div>
                  <p className="mb-3 text-sm text-[#97a0c8]">Press this once while you are on the network you will use (Wi-Fi or mobile data). If your network changes, press it again. Only one network can be active at a time.</p>
                  <a className={ghost} href={activateHref}>Activate my IP</a>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
