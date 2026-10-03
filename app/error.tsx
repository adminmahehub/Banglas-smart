'use client';

import React, { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // If webpack chunks or cache are stale, attempt automatic hard reload
    if (typeof window !== 'undefined') {
      try {
        if ('caches' in window) {
          caches.keys().then((names) => {
            for (const name of names) caches.delete(name);
          });
        }
      } catch {
        // ignore
      }
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl space-y-6">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl font-black">
          M
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">MaheHub System Sync</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            A new version of MaheHub was recently deployed. Click below to load the latest high-speed streaming infrastructure.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all shadow-lg active:scale-95"
          >
            Load Latest Version
          </button>

          <a
            href="https://wa.me/8801614082537"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-emerald-400 hover:underline"
          >
            Need help? Contact WhatsApp (+880 1614-082537)
          </a>
        </div>
      </div>
    </div>
  );
}
