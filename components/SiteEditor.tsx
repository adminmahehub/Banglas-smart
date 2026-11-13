'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Check, ChevronDown, ChevronUp, Copy, Eye, EyeOff, ExternalLink, ImagePlus, Plus, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { siteOrigin } from '../lib/siteOrigin';
import {
  BUILTIN, CustomSec, DEFAULT_BRAND, MediaItem, PRESETS, SiteContent, TEXT_FIELDS, ThemeCfg, orderedIds, parseContent, safeUrl,
} from '../lib/siteContent';
import { MediaView } from './SiteBlocks';

type Cls = { inp: string; card: string; primary: string; ghost: string };
const BUCKET = 'site-media';
const MAX_IMG = 10 * 1024 * 1024;
const MAX_VID = 50 * 1024 * 1024;
const GROUP_OF: Record<string, string> = { hero: 'Top banner', generator: 'Profile downloader', rates: 'Package rates', setup: 'Setup guide', reseller: 'Reseller business', api: 'Server / API connect' };
const COLOR_DEFAULTS = { main: '#06b6d4', green: '#10b981', gold: '#f59e0b', blue: '#2563eb', bg_dark: '#070b18', bg_light: '#f1f5f9' };

// Shrinks big photos in the browser (max 1920px, WebP) so the site stays fast and storage stays small.
async function shrinkImage(file: File): Promise<{ blob: Blob; ext: string; type: string }> {
  const keep = { blob: file as Blob, ext: (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'jpg', type: file.type };
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return keep;
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, 1920 / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d'); if (!ctx) return keep;
    ctx.drawImage(bmp, 0, 0, w, h);
    const blob: Blob | null = await new Promise((res) => cv.toBlob(res, 'image/webp', 0.86));
    if (blob && blob.size < file.size) return { blob, ext: 'webp', type: 'image/webp' };
  } catch { /* use the original file */ }
  return keep;
}

async function uploadMedia(file: File, kind: 'image' | 'video' | 'any'): Promise<string> {
  const isImg = /^image\//.test(file.type), isVid = /^video\//.test(file.type);
  if (kind === 'image' && !isImg) throw new Error('Choose an image file (JPG, PNG, WebP or GIF).');
  if (kind === 'video' && !isVid) throw new Error('Choose a video file (MP4 or WebM).');
  if (!isImg && !isVid) throw new Error('Only images and videos can be uploaded.');
  if (isImg && file.size > MAX_IMG * 3) throw new Error('This image is too big (max 30 MB).');
  if (isVid && file.size > MAX_VID) throw new Error('This video is bigger than 50 MB. Upload it to YouTube and paste the link instead, or compress it.');
  const prepared = isImg ? await shrinkImage(file) : { blob: file as Blob, ext: (file.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'mp4', type: file.type };
  if (isImg && prepared.blob.size > MAX_IMG) throw new Error('This image is still bigger than 10 MB after shrinking. Use a smaller one.');
  const path = `${new Date().toISOString().slice(0, 7)}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${prepared.ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, prepared.blob, { contentType: prepared.type, cacheControl: '31536000', upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function MediaField({ label, value, onChange, kind, cls, hint }: { label: string; value?: string; onChange: (v: string) => void; kind: 'image' | 'video' | 'any'; cls: Cls; hint?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const accept = kind === 'image' ? 'image/*' : kind === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/*,video/mp4,video/webm,video/quicktime';
  const asKind: 'image' | 'video' = kind === 'video' ? 'video' : kind === 'image' ? 'image' : (/\.(mp4|webm|mov)(\?|$)|youtu|vimeo/i.test(value || '') ? 'video' : 'image');
  async function pick(f?: File | null) {
    if (!f) return;
    setErr(''); setBusy(true);
    try { onChange(await uploadMedia(f, kind)); } catch (e: any) { setErr(e?.message || 'Upload failed'); }
    setBusy(false); if (ref.current) ref.current.value = '';
  }
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-[var(--mut)]">{label}</label>
      <div className="flex gap-2">
        <input className={cls.inp} value={value || ''} onChange={(e) => onChange(e.target.value.trim())} placeholder={kind === 'video' ? 'Paste a YouTube / video link, or upload' : 'Paste an image link, or upload'} />
        <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        <button type="button" disabled={busy} onClick={() => ref.current?.click()} className={`${cls.ghost} shrink-0 !px-3 disabled:opacity-50`}>{busy ? '…' : <Upload className="h-4 w-4" />}</button>
        {value && <button type="button" onClick={() => onChange('')} className={`${cls.ghost} shrink-0 !px-3 text-rose-500`}><X className="h-4 w-4" /></button>}
      </div>
      {hint && <div className="text-[11px] text-[var(--mut)]">{hint}</div>}
      {err && <div className="text-xs font-semibold text-rose-500">{err}</div>}
      {value && safeUrl(value) && <div className="max-w-[260px]"><MediaView item={{ kind: asKind, url: value }} className="w-full rounded-xl object-cover max-h-40 bg-black/20" /></div>}
      {value && !safeUrl(value) && <div className="text-xs font-semibold text-amber-500">This link is not allowed. It must start with https://</div>}
    </div>
  );
}

export default function SiteEditor({ cls, onClose }: { cls: Cls; onClose?: () => void }) {
  const { inp, card, primary, ghost } = cls;
  const [c, setC] = useState<SiteContent>({});
  const [raw0, setRaw0] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<string>('');
  const [addMenu, setAddMenu] = useState(false);
  const [prevKey, setPrevKey] = useState(0);
  const [showPrev, setShowPrev] = useState(false);
  const [files, setFiles] = useState<{ name: string; size: number; url: string; img: boolean }[]>([]);
  const [copied, setCopied] = useState('');
  const [hasPrev, setHasPrev] = useState(false);

  const loadFiles = async () => {
    const out: { name: string; size: number; url: string; img: boolean }[] = [];
    const { data: top } = await supabase.storage.from(BUCKET).list('', { limit: 100, sortBy: { column: 'name', order: 'desc' } });
    for (const f of top || []) {
      if (f.id) { out.push({ name: f.name, size: (f.metadata as any)?.size || 0, url: supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl, img: /\.(jpe?g|png|webp|gif)$/i.test(f.name) }); continue; }
      const { data: sub } = await supabase.storage.from(BUCKET).list(f.name, { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });
      for (const s of sub || []) if (s.id) { const p = `${f.name}/${s.name}`; out.push({ name: p, size: (s.metadata as any)?.size || 0, url: supabase.storage.from(BUCKET).getPublicUrl(p).data.publicUrl, img: /\.(jpe?g|png|webp|gif)$/i.test(s.name) }); }
    }
    setFiles(out);
  };
  useEffect(() => {
    supabase.rpc('public_site_settings').then(({ data }) => {
      const raw = String((data as any)?.site_content || '');
      setRaw0(raw); setC(parseContent(raw)); setLoaded(true);
    });
    supabase.from('app_settings').select('value').eq('key', 'site_content_prev').maybeSingle().then(({ data }) => setHasPrev(!!data?.value));
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ids = orderedIds(c);
  const removedBuiltins = BUILTIN.filter((b) => !ids.includes(b.id));
  const upd = (patch: Partial<SiteContent>) => setC((x) => ({ ...x, ...patch }));
  const updTheme = (patch: Partial<ThemeCfg>) => setC((x) => ({ ...x, theme: { ...(x.theme || {}), ...patch } }));
  const setText = (k: string, v: string) => setC((x) => ({ ...x, text: { ...(x.text || {}), [k]: v } }));
  const updCustom = (id: string, patch: Partial<CustomSec>) => setC((x) => ({ ...x, custom: (x.custom || []).map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  const move = (id: string, d: -1 | 1) => {
    const a = [...ids]; const i = a.indexOf(id); const j = i + d;
    if (i < 0 || j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]]; upd({ order: a });
  };
  const toggleHide = (id: string) => { const h = new Set(c.hidden || []); h.has(id) ? h.delete(id) : h.add(id); upd({ hidden: [...h], order: ids }); };
  const removeSec = (id: string) => {
    const isCustom = id.startsWith('c');
    if (!window.confirm(isCustom ? 'Delete this section? This cannot be undone after you save.' : 'Remove this section from the website? You can add it back later from "Add section".')) return;
    setC((x) => ({ ...x, order: ids.filter((i) => i !== id), custom: isCustom ? (x.custom || []).filter((s) => s.id !== id) : x.custom }));
    if (open === id) setOpen('');
  };
  const addCustom = (kind: 'block' | 'gallery') => {
    const n = Math.max(0, ...(c.custom || []).map((s) => Number(s.id.slice(1)) || 0)) + 1;
    const id = `c${n}`;
    const sec: CustomSec = { id, kind, title: kind === 'gallery' ? 'Gallery' : 'New section', text: '', layout: 'center', box: false, items: kind === 'gallery' ? [] : undefined };
    setC((x) => ({ ...x, custom: [...(x.custom || []), sec], order: [...ids, id] }));
    setOpen(id); setAddMenu(false);
  };
  const addBuiltin = (id: string) => { upd({ order: [...ids, id], hidden: (c.hidden || []).filter((h) => h !== id) }); setAddMenu(false); };

  const out = (): string => {
    const o: any = { v: 1 };
    const th: any = {}; for (const [k, v] of Object.entries(c.theme || {})) if (v) th[k] = v;
    if (Object.keys(th).length) o.theme = th;
    const br: any = {}; for (const [k, v] of Object.entries(c.brand || {})) if (v) br[k] = v;
    if (Object.keys(br).length) o.brand = br;
    const hr: any = {}; for (const [k, v] of Object.entries(c.hero || {})) if (v) hr[k] = v;
    if (Object.keys(hr).length) o.hero = hr;
    const tx: any = {}; for (const [k, v] of Object.entries(c.text || {})) if (v && v.trim()) tx[k] = v;
    if (Object.keys(tx).length) o.text = tx;
    const isDefaultOrder = JSON.stringify(ids) === JSON.stringify(BUILTIN.map((b) => b.id));
    if (!isDefaultOrder) o.order = ids;
    if ((c.hidden || []).length) o.hidden = c.hidden;
    if ((c.custom || []).length) o.custom = c.custom;
    return Object.keys(o).length === 1 ? '' : JSON.stringify(o);
  };
  const dirty = loaded && out() !== raw0;

  async function save() {
    // refuse links that the website would not show
    for (const [label, u] of [['logo', c.brand?.logo], ['hero background', c.hero?.bg_image], ['hero video', c.hero?.video], ['hero picture', c.hero?.image]] as const) {
      if (u && !safeUrl(u)) { alert(`The ${label} link must start with https://`); return; }
    }
    setBusy(true);
    const v = out();
    const { error } = await supabase.rpc('admin_set_site_content', { p_json: v });
    setBusy(false);
    if (error) { alert(error.message); return; }
    setRaw0(v); setHasPrev(true); setPrevKey((k) => k + 1);
    alert('Saved. The website now shows your changes.');
  }
  async function restore() {
    if (!window.confirm('Go back to the version before your last save?')) return;
    setBusy(true);
    const { error } = await supabase.rpc('admin_restore_site_content');
    if (error) { setBusy(false); alert(error.message); return; }
    const { data } = await supabase.rpc('public_site_settings');
    const raw = String((data as any)?.site_content || '');
    setRaw0(raw); setC(parseContent(raw)); setBusy(false); setPrevKey((k) => k + 1);
  }
  async function resetAll() {
    if (!window.confirm('Remove ALL your website edits and show the original website again? (You can still press "Restore earlier version" afterwards.)')) return;
    setBusy(true);
    const { error } = await supabase.rpc('admin_set_site_content', { p_json: '' });
    setBusy(false);
    if (error) { alert(error.message); return; }
    setRaw0(''); setC({}); setHasPrev(true); setPrevKey((k) => k + 1);
  }
  async function delFile(name: string) {
    if (!window.confirm('Delete this file? If the website uses it, the picture or video will disappear.')) return;
    const { error } = await supabase.storage.from(BUCKET).remove([name]);
    if (error) { alert(error.message); return; }
    loadFiles();
  }
  const copyUrl = async (u: string) => { try { await navigator.clipboard.writeText(u); setCopied(u); setTimeout(() => setCopied(''), 1200); } catch { window.prompt('Copy this link', u); } };

  if (!loaded) return <div className={`${card} p-6 text-sm text-[var(--mut)]`}>Loading…</div>;

  const th = c.theme || {};
  const colorRow = (k: 'main' | 'green' | 'gold' | 'blue', label: string, hint: string) => (
    <div key={k} className="flex items-center gap-3">
      <input type="color" value={th[k] || COLOR_DEFAULTS[k]} onChange={(e) => updTheme({ [k]: e.target.value })} className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--line)] bg-transparent p-0.5" />
      <div className="min-w-0 flex-1"><div className="text-sm font-bold text-[var(--ink)]">{label}</div><div className="text-[11px] text-[var(--mut)]">{hint}</div></div>
      {th[k] && <button type="button" className="text-xs font-bold text-[var(--mut)] underline" onClick={() => updTheme({ [k]: undefined })}>Original</button>}
    </div>
  );
  const bgRow = (k: 'bg_dark' | 'bg_light', label: string) => (
    <div key={k} className="flex items-center gap-3">
      <input type="color" value={th[k] || COLOR_DEFAULTS[k]} onChange={(e) => updTheme({ [k]: e.target.value })} className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--line)] bg-transparent p-0.5" />
      <div className="min-w-0 flex-1 text-sm font-bold text-[var(--ink)]">{label}</div>
      {th[k] && <button type="button" className="text-xs font-bold text-[var(--mut)] underline" onClick={() => updTheme({ [k]: undefined })}>Original</button>}
    </div>
  );

  const builtinPanel = (id: string) => (
    <div className="space-y-3 border-t border-[var(--line)] p-4">
      {id === 'hero' && (<>
        <MediaField cls={cls} kind="image" label="Background picture" value={c.hero?.bg_image} onChange={(v) => upd({ hero: { ...(c.hero || {}), bg_image: v } })} hint="Shown faintly behind the headline." />
        <MediaField cls={cls} kind="video" label="Background video (optional)" value={c.hero?.video} onChange={(v) => upd({ hero: { ...(c.hero || {}), video: v } })} hint="Needs a direct video file (MP4/WebM). It plays silently in a loop." />
        <MediaField cls={cls} kind="image" label="Picture under the buttons (optional)" value={c.hero?.image} onChange={(v) => upd({ hero: { ...(c.hero || {}), image: v } })} />
        <div className="rounded-xl bg-[var(--soft)] px-3 py-2 text-xs text-[var(--mut)]">The big headline and short description are in <b>Site &amp; Notices</b>.</div>
      </>)}
      {id === 'rates' && <div className="rounded-xl bg-[var(--soft)] px-3 py-2 text-xs text-[var(--mut)]">Prices and plan names are in <b>Site &amp; Notices</b> (Customer home page).</div>}
      {TEXT_FIELDS.filter((f) => f.group === GROUP_OF[id]).map((f) => (
        <div key={f.key}>
          <label className="text-xs font-bold text-[var(--mut)]">{f.label}</label>
          {f.long
            ? <textarea className={`${inp} min-h-[60px]`} value={c.text?.[f.key] ?? ''} placeholder={f.def} onChange={(e) => setText(f.key, e.target.value)} />
            : <input className={inp} value={c.text?.[f.key] ?? ''} placeholder={f.def} onChange={(e) => setText(f.key, e.target.value)} />}
        </div>
      ))}
      <div className="text-[11px] text-[var(--mut)]">Empty box = the original text (shown in grey).</div>
    </div>
  );

  const customPanel = (s: CustomSec) => (
    <div className="space-y-3 border-t border-[var(--line)] p-4">
      <div><label className="text-xs font-bold text-[var(--mut)]">Title</label><input className={inp} value={s.title || ''} onChange={(e) => updCustom(s.id, { title: e.target.value })} /></div>
      <div><label className="text-xs font-bold text-[var(--mut)]">Text</label><textarea className={`${inp} min-h-[90px]`} value={s.text || ''} onChange={(e) => updCustom(s.id, { text: e.target.value })} /></div>
      {s.kind === 'block' && (<>
        <MediaField cls={cls} kind="image" label="Picture" value={s.image} onChange={(v) => updCustom(s.id, { image: v })} />
        <MediaField cls={cls} kind="video" label="Video" value={s.video} onChange={(v) => updCustom(s.id, { video: v })} hint="YouTube / Vimeo link, or upload an MP4." />
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-xs font-bold text-[var(--mut)]">Button text</label><input className={inp} value={s.button_text || ''} onChange={(e) => updCustom(s.id, { button_text: e.target.value })} placeholder="Order now" /></div>
          <div><label className="text-xs font-bold text-[var(--mut)]">Button link</label><input className={inp} value={s.button_url || ''} onChange={(e) => updCustom(s.id, { button_url: e.target.value.trim() })} placeholder="https://wa.me/8801…" /></div>
        </div>
        <div>
          <label className="text-xs font-bold text-[var(--mut)]">Layout</label>
          <select className={inp} value={s.layout || 'center'} onChange={(e) => updCustom(s.id, { layout: e.target.value as any })}>
            <option value="center">Centered (text, then picture/video)</option>
            <option value="left">Picture/video on the left</option>
            <option value="right">Picture/video on the right</option>
          </select>
        </div>
      </>)}
      {s.kind === 'gallery' && (
        <div className="space-y-3">
          {(s.items || []).map((it: MediaItem, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-[var(--line)] p-3">
              <MediaField cls={cls} kind="any" label={`Item ${i + 1} (picture or video)`} value={it.url} onChange={(v) => updCustom(s.id, { items: (s.items || []).map((x, j) => (j === i ? { ...x, url: v, kind: /\.(mp4|webm|mov)(\?|$)|youtu|vimeo/i.test(v) ? 'video' : 'image' } : x)) })} />
              <input className={inp} placeholder="Caption (optional)" value={it.caption || ''} onChange={(e) => updCustom(s.id, { items: (s.items || []).map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)) })} />
              <div className="flex gap-2">
                <button type="button" className={`${ghost} !px-3 !py-1.5 text-xs`} disabled={i === 0} onClick={() => { const a = [...(s.items || [])]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; updCustom(s.id, { items: a }); }}><ArrowUp className="h-3.5 w-3.5" /></button>
                <button type="button" className={`${ghost} !px-3 !py-1.5 text-xs`} disabled={i === (s.items || []).length - 1} onClick={() => { const a = [...(s.items || [])]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; updCustom(s.id, { items: a }); }}><ArrowDown className="h-3.5 w-3.5" /></button>
                <button type="button" className={`${ghost} !px-3 !py-1.5 text-xs text-rose-500`} onClick={() => updCustom(s.id, { items: (s.items || []).filter((_, j) => j !== i) })}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
          {(s.items || []).length < 24 && <button type="button" className={ghost} onClick={() => updCustom(s.id, { items: [...(s.items || []), { kind: 'image', url: '' }] })}><ImagePlus className="h-4 w-4" />Add picture / video</button>}
          <div className="text-[11px] text-[var(--mut)]">Items without a link are not shown.</div>
        </div>
      )}
      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]"><input type="checkbox" checked={!!s.box} onChange={(e) => updCustom(s.id, { box: e.target.checked })} />Show inside a card (box)</label>
    </div>
  );

  const secName = (id: string) => BUILTIN.find((b) => b.id === id)?.label || (c.custom || []).find((s) => s.id === id)?.title || 'Section';

  return (
    <div className="space-y-6 pb-28">
      {/* BRAND + COLOURS */}
      <div className={`${card} p-5 space-y-4`}>
        <div className="font-black">Logo and name (top bar)</div>
        <MediaField cls={cls} kind="image" label="Logo" value={c.brand?.logo} onChange={(v) => upd({ brand: { ...(c.brand || {}), logo: v } })} hint="Square picture works best." />
        <div className="grid gap-2 sm:grid-cols-2">
          <div><label className="text-xs font-bold text-[var(--mut)]">Website name</label><input className={inp} value={c.brand?.name || ''} placeholder={DEFAULT_BRAND.name} onChange={(e) => upd({ brand: { ...(c.brand || {}), name: e.target.value.slice(0, 60) } })} /></div>
          <div><label className="text-xs font-bold text-[var(--mut)]">Small line under the name</label><input className={inp} value={c.brand?.tagline || ''} placeholder={DEFAULT_BRAND.tagline} onChange={(e) => upd({ brand: { ...(c.brand || {}), tagline: e.target.value.slice(0, 100) } })} /></div>
        </div>
      </div>

      <div className={`${card} p-5 space-y-4`}>
        <div className="font-black">Colours and font</div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.name} type="button" className={`${ghost} !py-1.5 text-xs`} onClick={() => updTheme({ main: undefined, green: undefined, gold: undefined, blue: undefined, bg_dark: undefined, bg_light: undefined, ...p.theme })}>{p.name}</button>
          ))}
        </div>
        <div className="space-y-3">
          {colorRow('main', 'Main colour', 'Highlights, badges, glowing lines (cyan on the original)')}
          {colorRow('green', 'Green colour', 'Download button, “online” dots, success')}
          {colorRow('gold', 'Gold colour', 'Rates tag, reseller section')}
          {colorRow('blue', 'Blue buttons', 'Second button and links')}
          {bgRow('bg_dark', 'Page background (dark mode)')}
          {bgRow('bg_light', 'Page background (light mode)')}
        </div>
        <div>
          <label className="text-xs font-bold text-[var(--mut)]">Font style</label>
          <select className={inp} value={th.font || 'default'} onChange={(e) => updTheme({ font: e.target.value as any })}>
            <option value="default">Original</option><option value="serif">Classic (serif)</option><option value="rounded">Soft and round</option><option value="mono">Technical (monospace)</option>
          </select>
        </div>
        <div className="text-[11px] text-[var(--mut)]">Tip: after saving, open the website to check both dark and light mode.</div>
      </div>

      {/* SECTIONS */}
      <div className={`${card} p-5 space-y-3`}>
        <div className="flex items-center justify-between gap-3">
          <div className="font-black">Website sections</div>
          <div className="relative">
            <button type="button" className={ghost} onClick={() => setAddMenu(!addMenu)}><Plus className="h-4 w-4" />Add section</button>
            {addMenu && (
              <div className="absolute right-0 z-20 mt-2 w-64 space-y-1 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-2 shadow-xl">
                <button type="button" className="w-full rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-[var(--soft)]" onClick={() => addCustom('block')}>New section (text + picture/video)</button>
                <button type="button" className="w-full rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-[var(--soft)]" onClick={() => addCustom('gallery')}>New gallery (many pictures/videos)</button>
                {removedBuiltins.length > 0 && <div className="px-3 pt-1 text-[11px] font-bold text-[var(--mut)]">Add back a removed section</div>}
                {removedBuiltins.map((b) => <button key={b.id} type="button" className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-[var(--soft)]" onClick={() => addBuiltin(b.id)}>{b.label}</button>)}
              </div>
            )}
          </div>
        </div>
        <div className="text-xs text-[var(--mut)]">Use the arrows to change the order. The eye hides a section. The bin removes it. The footer (contact numbers) always stays at the bottom.</div>
        <div className="space-y-2">
          {ids.map((id, i) => {
            const hidden = (c.hidden || []).includes(id);
            const cs = (c.custom || []).find((s) => s.id === id);
            const b = BUILTIN.find((x) => x.id === id);
            return (
              <div key={id} className={`rounded-2xl border border-[var(--line)] ${hidden ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black text-[var(--ink)]">{i + 1}. {secName(id)}{hidden && <span className="ml-2 text-[10px] font-bold text-amber-500">HIDDEN</span>}</div>
                    <div className="truncate text-[11px] text-[var(--mut)]">{b?.hint || (cs?.kind === 'gallery' ? 'Gallery (added by you)' : 'Section added by you')}</div>
                  </div>
                  <button type="button" className={`${ghost} !px-2.5 !py-1.5`} disabled={i === 0} onClick={() => move(id, -1)} aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" className={`${ghost} !px-2.5 !py-1.5`} disabled={i === ids.length - 1} onClick={() => move(id, 1)} aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                  {b && <button type="button" className={`${ghost} !px-2.5 !py-1.5`} onClick={() => toggleHide(id)} aria-label={hidden ? 'Show' : 'Hide'}>{hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}
                  <button type="button" className={`${ghost} !px-2.5 !py-1.5`} onClick={() => setOpen(open === id ? '' : id)} aria-label="Edit">{open === id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
                  <button type="button" className={`${ghost} !px-2.5 !py-1.5 text-rose-500`} onClick={() => removeSec(id)} aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                </div>
                {open === id && (cs ? customPanel(cs) : builtinPanel(id))}
              </div>
            );
          })}
          {ids.length === 0 && <div className="rounded-xl bg-[var(--soft)] px-3 py-4 text-center text-sm text-[var(--mut)]">All sections are removed. Use “Add section”.</div>}
        </div>
        <div className="text-[11px] text-[var(--mut)]">Note: the customer home page shows Top banner, Profile downloader, Package rates and Setup guide. “Reseller business” and “Server / API connect” show on the reseller page.</div>
      </div>

      {/* LIBRARY */}
      <div className={`${card} p-5 space-y-3`}>
        <div className="flex items-center justify-between"><div className="font-black">Uploaded files</div><button type="button" className={`${ghost} !py-1.5 text-xs`} onClick={loadFiles}>Refresh</button></div>
        {files.length === 0 && <div className="text-sm text-[var(--mut)]">Nothing uploaded yet. Use the upload button next to any picture or video field.</div>}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {files.map((f) => (
            <div key={f.name} className="space-y-1.5 rounded-xl border border-[var(--line)] p-2">
              {f.img ? (/* eslint-disable-next-line @next/next/no-img-element */ <img src={f.url} alt="" loading="lazy" className="h-24 w-full rounded-lg object-cover" />) : <video src={f.url} preload="metadata" className="h-24 w-full rounded-lg bg-black object-cover" />}
              <div className="truncate text-[10px] text-[var(--mut)]">{f.name.split('/').pop()}{f.size ? ` · ${(f.size / 1024 / 1024).toFixed(1)} MB` : ''}</div>
              <div className="flex gap-1.5">
                <button type="button" className={`${ghost} flex-1 !px-2 !py-1 text-[11px]`} onClick={() => copyUrl(f.url)}>{copied === f.url ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}Link</button>
                <button type="button" className={`${ghost} !px-2 !py-1 text-rose-500`} onClick={() => delFile(f.name)}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PREVIEW */}
      <div className={`${card} p-5 space-y-3`}>
        <div className="flex items-center justify-between gap-3">
          <div className="font-black">Preview</div>
          <div className="flex gap-2">
            <button type="button" className={`${ghost} !py-1.5 text-xs`} onClick={() => setShowPrev(!showPrev)}>{showPrev ? 'Hide' : 'Show'} preview here</button>
            <a className={`${ghost} !py-1.5 text-xs`} href={`${siteOrigin()}/`} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" />Open website</a>
          </div>
        </div>
        <div className="text-xs text-[var(--mut)]">The preview shows the SAVED website. Press “Save and publish” first, then it refreshes.</div>
        {showPrev && <iframe key={prevKey} title="Website preview" src={`${siteOrigin()}/?p=${prevKey}`} className="h-[640px] w-full rounded-2xl border border-[var(--line)] bg-white" />}
      </div>

      {/* SAVE BAR */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--line)] bg-[var(--card)]/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2">
          <div className="mr-auto text-xs font-bold text-[var(--mut)]">{dirty ? '● You have unsaved changes' : 'All changes are saved'}</div>
          {hasPrev && <button type="button" disabled={busy} className={`${ghost} !py-2 text-xs disabled:opacity-50`} onClick={restore}>Restore earlier version</button>}
          <button type="button" disabled={busy} className={`${ghost} !py-2 text-xs text-rose-500 disabled:opacity-50`} onClick={resetAll}>Back to original website</button>
          {onClose && <button type="button" className={`${ghost} !py-2 text-xs`} onClick={onClose}>Close</button>}
          <button type="button" disabled={busy || !dirty} className={`${primary} !w-auto disabled:opacity-50`} onClick={save}>{busy ? 'Please wait…' : 'Save and publish'}</button>
        </div>
      </div>
    </div>
  );
}
