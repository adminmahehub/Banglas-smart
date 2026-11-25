// Small helpers that behave normally on the website and use native features inside the mobile app.
const native = () => process.env.NEXT_PUBLIC_APP_MODE === 'native';

export async function openLink(url: string): Promise<void> {
  if (native()) {
    try { const { AppLauncher } = await import('@capacitor/app-launcher'); await AppLauncher.openUrl({ url }); return; } catch { /* fall through */ }
  }
  window.open(url, '_blank');
}

export async function copyText(text: string): Promise<void> {
  if (native()) {
    try { const { Clipboard } = await import('@capacitor/clipboard'); await Clipboard.write({ string: text }); return; } catch { /* fall through */ }
  }
  try { await navigator.clipboard?.writeText(text); } catch { /* ignore */ }
}

/** Saves a text file. Website: normal download. Android app: straight into Downloads (falls back to Save-as, then the share sheet). Returns a short message to show. */
export async function saveTextFile(name: string, text: string): Promise<string> {
  if (native()) {
    const { Capacitor, registerPlugin } = await import('@capacitor/core');
    if (Capacitor.getPlatform() === 'android') {
      const MaheNative: any = registerPlugin('MaheNative');
      try { await MaheNative.saveToDownloads({ name, text }); return `Saved in your Downloads folder as ${name}. In WireGuard: + → Import from file or archive → Downloads → ${name}.`; } catch { /* try Save-as */ }
      try { await MaheNative.saveFile({ name, text }); return `Saved ${name}. In WireGuard: + → Import from file or archive.`; } catch (e: any) { if (/cancel/i.test(String(e?.message || e?.code || ''))) return ''; /* share sheet below */ }
    }
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const f = await Filesystem.writeFile({ path: name, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 });
    await Share.share({ title: name, dialogTitle: name, url: f.uri });
    return '';
  }
  const url = URL.createObjectURL(new Blob([text], { type: 'application/octet-stream' }));
  const a = document.createElement('a');
  a.href = url; a.download = name; a.style.display = 'none';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return '';
}

/** Share a text file with another app (WhatsApp, Telegram, Drive...). */
export async function shareTextFile(name: string, text: string): Promise<void> {
  if (native()) {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const f = await Filesystem.writeFile({ path: name, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 });
    await Share.share({ title: name, dialogTitle: name, url: f.uri });
    return;
  }
  const file = new File([text], name, { type: 'text/plain' });
  const nav: any = navigator;
  if (nav.canShare && nav.canShare({ files: [file] })) { await nav.share({ files: [file], title: name }); return; }
  if (nav.share) { await nav.share({ title: name, text }); return; }
  throw new Error('share_unsupported');
}
