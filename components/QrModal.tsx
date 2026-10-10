'use client';
import { useMemo } from 'react';
import { X, Download } from 'lucide-react';
import { qrMatrix, qrSvgParts } from '../lib/qr';

const btn = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition active:scale-95';
const ghost = `${btn} border border-[var(--line)] bg-[var(--card)] text-[var(--ink)] hover:bg-[var(--soft)]`;

/** Shows a QR code made in the browser from `text` (nothing is uploaded). Used for WireGuard configs. */
export default function QrModal({ title, text, onClose, style }: { title: string; text: string; onClose: () => void; style?: React.CSSProperties }) {
  const qr = useMemo(() => { try { return qrSvgParts(text); } catch { return null; } }, [text]);

  const savePng = () => {
    try {
      const m = qrMatrix(text); const quiet = 4; const scale = 10; const n = m.length + quiet * 2;
      const c = document.createElement('canvas'); c.width = c.height = n * scale;
      const g = c.getContext('2d'); if (!g) return;
      g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#000';
      for (let y = 0; y < m.length; y++) for (let x = 0; x < m.length; x++) if (m[y][x]) g.fillRect((x + quiet) * scale, (y + quiet) * scale, scale, scale);
      c.toBlob((b) => {
        if (!b) return;
        const url = URL.createObjectURL(b); const a = document.createElement('a');
        a.href = url; a.download = `${title.slice(0, 15)}-wireguard-qr.png`; a.style.display = 'none';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }, 'image/png');
    } catch { alert('Could not save the QR image.'); }
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-[var(--card)] border border-[var(--line)] p-6 text-[var(--ink)] shadow-[0_8px_30px_rgba(60,72,140,0.07)]" onClick={(e) => e.stopPropagation()} style={style}>
        <div className="flex items-center justify-between mb-1"><h3 className="text-lg font-black">WireGuard QR</h3><button onClick={onClose}><X className="h-5 w-5" /></button></div>
        <p className="text-xs text-[var(--mut)] mb-3 break-all">Account: <b>{title}</b></p>
        {qr ? (
          <div className="mx-auto w-full max-w-[300px] rounded-xl bg-white p-1">
            <svg viewBox={`0 0 ${qr.size} ${qr.size}`} className="block w-full h-auto" shapeRendering="crispEdges" role="img" aria-label="WireGuard QR code">
              <rect width={qr.size} height={qr.size} fill="#fff" /><path d={qr.path} fill="#000" />
            </svg>
          </div>
        ) : <div className="rounded-xl bg-[var(--soft)] p-4 text-sm text-rose-500">This config is too long for a QR code. Use Download .conf instead.</div>}
        <ol className="mt-3 list-decimal pl-5 text-xs text-[var(--mut)] space-y-0.5">
          <li>Customer opens the <b>WireGuard</b> app and taps <b>+</b>.</li>
          <li>Choose <b>Scan from QR code</b> and scan this screen.</li>
          <li>Name the tunnel, then turn it on.</li>
        </ol>
        <p className="mt-3 rounded-xl bg-amber-500/10 px-3 py-2 text-[11px] font-semibold text-amber-600">This QR holds the customer&apos;s private key. Show it only to that customer and do not post it in groups.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className={ghost} onClick={savePng} disabled={!qr}><Download className="h-4 w-4" />Save image</button>
          <button className={ghost} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
