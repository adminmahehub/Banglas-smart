'use client';

import React from 'react';
import { CustomSec, MediaItem, embedFor, safeUrl } from '../lib/siteContent';

// One image or video (YouTube / Vimeo link, or a direct video file)
export function MediaView({ item, className }: { item: MediaItem; className?: string }) {
  if (item.kind === 'image') {
    const src = safeUrl(item.url);
    // eslint-disable-next-line @next/next/no-img-element
    return src ? <img src={src} alt={item.caption || ''} loading="lazy" className={className || 'w-full rounded-2xl object-cover'} /> : null;
  }
  const e = embedFor(item.url);
  if (e.kind === 'iframe') {
    return (
      <div className={`relative w-full overflow-hidden rounded-2xl ${className || ''}`} style={{ aspectRatio: '16 / 9' }}>
        <iframe src={e.src} title={item.caption || 'Video'} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="absolute inset-0 h-full w-full border-0" />
      </div>
    );
  }
  if (e.kind === 'video') return <video src={e.src} controls playsInline preload="metadata" className={className || 'w-full rounded-2xl bg-black'} />;
  return null;
}

// A section made by the admin: text + image/video + button, or a gallery
export function CustomBlock({ c, dark }: { c: CustomSec; dark: boolean }) {
  const ink = dark ? 'text-white' : 'text-slate-900';
  const sub = dark ? 'text-slate-300' : 'text-slate-600';
  const btnUrl = safeUrl(c.button_url);
  const external = /^https?:/i.test(btnUrl);
  const box = c.box
    ? `rounded-3xl border p-6 sm:p-10 shadow-xl ${dark ? 'bg-gradient-to-b from-[#0f172f] to-[#0a1022] border-slate-800' : 'bg-white border-slate-200'}`
    : '';

  if (c.kind === 'gallery') {
    const items = c.items || [];
    if (!items.length && !c.title && !c.text) return null;
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className={box}>
          {(c.title || c.text) && (
            <div className="text-center space-y-2 max-w-2xl mx-auto mb-8">
              {c.title && <h2 className={`text-2xl sm:text-4xl font-black ${ink}`}>{c.title}</h2>}
              {c.text && <p className={`text-sm sm:text-base whitespace-pre-line ${sub}`}>{c.text}</p>}
            </div>
          )}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it, i) => (
              <figure key={i} className="space-y-2">
                <MediaView item={it} className="w-full aspect-video rounded-2xl object-cover bg-black/20" />
                {it.caption && <figcaption className={`text-xs text-center ${sub}`}>{it.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const hasMedia = !!(c.image || c.video);
  if (!c.title && !c.text && !hasMedia && !c.button_text) return null;
  const side = c.layout === 'left' || c.layout === 'right';
  const media = hasMedia && (
    <div className="w-full space-y-4">
      {c.video && <MediaView item={{ kind: 'video', url: c.video }} />}
      {c.image && <MediaView item={{ kind: 'image', url: c.image, caption: c.title }} />}
    </div>
  );
  const body = (
    <div className={`space-y-3 ${side ? 'text-left' : 'text-center max-w-3xl mx-auto'}`}>
      {c.title && <h2 className={`text-2xl sm:text-4xl font-black ${ink}`}>{c.title}</h2>}
      {c.text && <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${sub}`}>{c.text}</p>}
      {c.button_text && btnUrl && (
        <a href={btnUrl} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} className="inline-flex px-7 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-sm shadow-xl hover:brightness-110 transition">
          {c.button_text}
        </a>
      )}
    </div>
  );
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
      <div className={box}>
        {side ? (
          <div className="grid gap-8 md:grid-cols-2 items-center">
            {c.layout === 'left' ? <>{media}{body}</> : <>{body}{media}</>}
          </div>
        ) : (
          <div className="space-y-8">{body}{media}</div>
        )}
      </div>
    </section>
  );
}
