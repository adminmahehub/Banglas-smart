'use client';
import React from 'react';
import { X } from 'lucide-react';
import { SiteContent, safeUrl } from '../lib/siteContent';

// Popup poster / message with an X button. The parent decides when it is open (once per app open / login).
export default function PopupNotice({ popup, onClose, dark, onLink }: { popup: SiteContent['popup']; onClose: () => void; dark: boolean; onLink?: (url: string) => void }) {
  if (!popup || !popup.on) return null;
  const img = safeUrl(popup.image);
  const btn = safeUrl(popup.button_url);
  if (!img && !popup.title && !popup.text) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/65 p-4" onClick={onClose}>
      <div className={`relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl ${dark ? 'bg-[#0f172f] text-white' : 'bg-white text-slate-900'}`} onClick={(e) => e.stopPropagation()}>
        <button aria-label="Close" onClick={onClose} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white"><X className="h-5 w-5" /></button>
        {img && /* eslint-disable-next-line @next/next/no-img-element */ <img src={img} alt={popup.title || ''} className="w-full rounded-t-3xl object-cover" />}
        {(popup.title || popup.text || (popup.button_text && btn)) && (
          <div className="space-y-2 p-5 text-center">
            {popup.title && <div className="text-lg font-black">{popup.title}</div>}
            {popup.text && <p className="whitespace-pre-line text-sm opacity-80">{popup.text}</p>}
            {popup.button_text && btn && (
              <a href={btn} onClick={(e) => { if (onLink) { e.preventDefault(); onLink(btn); } }} target="_blank" rel="noreferrer" className="mt-2 inline-flex rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-black text-white">{popup.button_text}</a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
