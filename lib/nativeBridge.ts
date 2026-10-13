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

/** Saves a text file. Website: normal download. App: writes to cache and opens the phone share sheet. */
export async function saveTextFile(name: string, text: string): Promise<void> {
  if (native()) {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const f = await Filesystem.writeFile({ path: name, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 });
    await Share.share({ title: name, dialogTitle: name, url: f.uri });
    return;
  }
  const url = URL.createObjectURL(new Blob([text], { type: 'application/octet-stream' }));
  const a = document.createElement('a');
  a.href = url; a.download = name; a.style.display = 'none';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
