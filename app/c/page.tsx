'use client';
import { useEffect, useState } from 'react';
import QrModal from '../../components/QrModal';

const FN = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ssaqdsqopxclkplstpzj.supabase.co') + '/functions/v1';
const BASE = FN + '/dns-portal';
const WG = FN + '/dns-wg';
const ACT = FN + '/dns-activate';
const QR_THEME = { '--card': '#141c38', '--line': '#232c52', '--ink': '#eef1ff', '--mut': '#97a0c8', '--soft': '#1b2547' } as React.CSSProperties;

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
  const [act, setAct] = useState('');
  const [wgBusy, setWgBusy] = useState('');
  const [wgMsg, setWgMsg] = useState('');
  const [qr, setQr] = useState('');
  const [auto, setAuto] = useState<'' | 'busy' | 'ok' | 'locked' | 'ipv6' | 'vpn_on' | 'expired' | 'error'>('');
  const [autoIp, setAutoIp] = useState('');

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('t') || '';
    setToken(t);
    setAct(new URLSearchParams(window.location.search).get('act') || '');
    if (!t) { setInfo({ found: false }); setLoading(false); return; }
    fetch(`${BASE}?t=${encodeURIComponent(t)}`)
      .then((r) => (r.ok ? r.json() : { found: false }))
      .then((d) => setInfo(d))
      .catch(() => setInfo({ found: false }))
      .finally(() => setLoading(false));
  }, []);

  // Activate the IP automatically as soon as the customer opens the link (no button needed).
  useEffect(() => {
    if (!token || !info?.found || !info.valid || info.blocked || act) return;
    let off = false;
    setAuto('busy');
    fetch(`${ACT}?t=${encodeURIComponent(token)}`, { cache: 'no-store' })
      .then((r) => r.json().catch(() => ({ ok: false, error: 'error' })))
      .then((d) => {
        if (off) return;
        if (d?.ok) { setAuto('ok'); setAutoIp(d.ip || ''); setInfo((i) => (i ? { ...i, bound_ip: d.ip || i.bound_ip } : i)); }
        else setAuto(d?.error === 'locked' ? 'locked' : d?.error === 'ipv6' ? 'ipv6' : d?.error === 'vpn_on' ? 'vpn_on' : d?.error === 'expired' ? 'expired' : 'error');
      })
      .catch(() => { if (!off) setAuto('error'); });
    return () => { off = true; };
  }, [token, info?.found, info?.valid, info?.blocked, act]);

  const copyHost = () => {
    try { navigator.clipboard?.writeText(info?.hostname || ''); } catch { /* ignore */ }
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  async function wgConf(): Promise<string | null> {
    setWgMsg('');
    try {
      const r = await fetch(`${WG}?t=${encodeURIComponent(token)}`, { cache: 'no-store' });
      if (!r.ok) {
        let code = '';
        try { code = (await r.json())?.error || ''; } catch { /* not JSON */ }
        setWgMsg(
          code === 'device_locked' ? 'This WireGuard config was locked because it was used on 2 or more devices. One account works on one phone only. Please contact your seller to unlock it.'
          : r.status === 403 ? 'Your subscription is not active.'
          : r.status === 404 ? 'This link was not found. Please ask your seller for a new link.'
          : 'WireGuard is not ready right now. Please try again later or contact your seller.');
        return null;
      }
      return await r.text();
    } catch { setWgMsg('Could not connect. Please check your internet and try again.'); return null; }
  }
  async function wgCopy() {
    setWgBusy('copy'); const t = await wgConf(); setWgBusy('');
    if (!t) return;
    try { await navigator.clipboard.writeText(t); setWgMsg('Config copied. Open WireGuard → + → Create from text.'); } catch { setWgMsg('Could not copy. Use Download instead.'); }
  }
  async function wgDownload() {
    setWgBusy('dl'); const t = await wgConf(); setWgBusy('');
    if (!t) return;
    const url = URL.createObjectURL(new Blob([t], { type: 'application/octet-stream' }));
    const a = document.createElement('a'); a.href = url; a.download = 'mahehub.conf'; a.style.display = 'none';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    setWgMsg('Downloaded. Open the file with the WireGuard app.');
  }
  async function wgQr() {
    setWgBusy('qr'); const t = await wgConf(); setWgBusy('');
    if (t) setQr(t);
  }

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
                : <div className="mt-1 text-xs text-amber-400">{auto === 'busy' ? 'Activating your IP…' : 'Not activated yet. See step 3 below.'}</div>}
            </div>

            {act === 'locked' && (
              <div className="mb-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-300">
                This DNS is locked to another device. Please contact your seller to unlock it.
              </div>
            )}

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
                  {auto === 'busy' && <p className="text-sm text-[#97a0c8]">Activating your network automatically…</p>}
                  {auto === 'ok' && <p className="text-sm text-emerald-400">✓ Activated automatically{autoIp ? ` for ${autoIp}` : ''}. If you change Wi-Fi or mobile data, just open this link again.</p>}
                  {auto === 'vpn_on' && <p className="text-sm text-amber-400">WireGuard is switched on. Turn WireGuard off, then open this link again to activate your normal network.</p>}
                  {auto === 'locked' && <p className="text-sm text-amber-400">This DNS is locked to another network. Please contact your seller to unlock it.</p>}
                  {auto === 'expired' && <p className="text-sm text-amber-400">Your subscription is not active. Please contact your seller to renew.</p>}
                  {(auto === '' || auto === 'ipv6' || auto === 'error') && (<>
                    <p className="mb-3 text-sm text-[#97a0c8]">{auto === 'ipv6' || auto === 'error' ? 'Automatic activation did not work on this network. Press this button once while you are on the network you will use.' : 'Press this once while you are on the network you will use (Wi-Fi or mobile data). If your network changes, press it again.'}</p>
                    <a className={ghost} href={activateHref}>Activate my IP</a>
                  </>)}
                </div>

                <div className={card}>
                  <div className="mb-1 font-black">4. WireGuard (full VPN)</div>
                  <p className="mb-3 text-sm text-[#97a0c8]">Install the <b>WireGuard</b> app, then scan the QR code, import the file or paste the config. Keep this config private.</p>
                  <div className="space-y-2">
                    <button className={primary} disabled={!!wgBusy} onClick={wgQr}>{wgBusy === 'qr' ? 'Please wait…' : 'Show QR code'}</button>
                    <button className={ghost} disabled={!!wgBusy} onClick={wgDownload}>{wgBusy === 'dl' ? 'Please wait…' : 'Download .conf file'}</button>
                    <button className={ghost} disabled={!!wgBusy} onClick={wgCopy}>{wgBusy === 'copy' ? 'Please wait…' : 'Copy config text'}</button>
                  </div>
                  {wgMsg && <div className="mt-3 text-center text-xs text-amber-400">{wgMsg}</div>}
                </div>
              </>
            )}
          </>
        )}
      </div>
      {qr && <QrModal title={info?.phone_hint ? `•••• ${info.phone_hint}` : 'WireGuard'} text={qr} onClose={() => setQr('')} style={QR_THEME} />}
    </div>
  );
}
