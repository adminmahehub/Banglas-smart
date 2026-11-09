'use client';
import { ShieldAlert, Sparkles, X } from 'lucide-react';

type Props = {
  kind: string;
  title: string;
  body?: string;
  onClose?: () => void;
};

/**
 * One premium look for every announcement (website, reseller panel, mobile app).
 * Dark obsidian card, fine gold border, no emoji, no bouncing. Works on light and dark pages.
 */
export default function NoticeCard({ kind, title, body, onClose }: Props) {
  const offer = kind === 'offer';
  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-200/80 via-amber-500/25 to-amber-300/70 p-px shadow-[0_10px_30px_-12px_rgba(245,158,11,0.45)]">
      <div className="relative overflow-hidden rounded-[15px] bg-[#0a0c13] px-4 py-4 sm:px-5">
        <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/60 to-transparent" />
        <div className="relative flex items-start gap-3.5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-[#2a1c00] shadow-inner">
            {offer ? <Sparkles className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1 pr-7">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-300/90">
              <span>{offer ? 'Exclusive offer' : 'Official notice'}</span>
              <span className="h-px flex-1 bg-gradient-to-r from-amber-300/40 to-transparent" />
            </div>
            <div className="mt-1.5 text-[15px] font-extrabold leading-snug tracking-tight text-white sm:text-base">{title}</div>
            {body ? <div className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-slate-300/90">{body}</div> : null}
            <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/55">
              <img src="/icon-512.png" alt="" className="h-4 w-4 rounded" />
              <span>MaheHub · Smart DNS &amp; VPN</span>
            </div>
          </div>
        </div>
        {onClose ? (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
