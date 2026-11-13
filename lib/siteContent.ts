// Content of the public website that the admin can edit from "Website Editor".
// It is stored as ONE JSON text in app_settings (key site_content). Everything here is optional:
// when a value is missing, the website shows the built-in text/look, so an empty setting = the original site.

export type SecId = 'hero' | 'generator' | 'rates' | 'setup' | 'reseller' | 'api';
export const BUILTIN: { id: SecId; label: string; hint: string }[] = [
  { id: 'hero', label: 'Top banner (hero)', hint: 'Big headline, badge and the two buttons at the top' },
  { id: 'generator', label: 'Profile downloader', hint: 'The box where customers paste their hostname and download the profile' },
  { id: 'rates', label: 'Package rates', hint: 'Price cards (edit the prices in Site & Notices)' },
  { id: 'setup', label: 'Setup guide', hint: 'iPhone / Android setup steps' },
  { id: 'reseller', label: 'Reseller business', hint: 'Reseller offer and earning calculator' },
  { id: 'api', label: 'Server / API connect', hint: 'B2B API section with the tabs and simulator' },
];

export type MediaItem = { kind: 'image' | 'video'; url: string; caption?: string };
export type CustomSec = {
  id: string; // c1, c2 ...
  kind: 'block' | 'gallery';
  title?: string; text?: string;
  image?: string; video?: string;
  button_text?: string; button_url?: string;
  layout?: 'center' | 'left' | 'right';
  box?: boolean; // show on a card
  items?: MediaItem[]; // gallery
};

export type ThemeCfg = {
  main?: string; green?: string; gold?: string; blue?: string; // brand colours
  bg_dark?: string; bg_light?: string; // page background
  font?: 'default' | 'serif' | 'rounded' | 'mono';
};

export type SiteContent = {
  v?: 1;
  theme?: ThemeCfg;
  brand?: { name?: string; tagline?: string; logo?: string };
  hero?: { bg_image?: string; video?: string; image?: string };
  text?: Record<string, string>;
  order?: string[]; // ids of built-in and custom sections, top to bottom
  hidden?: string[]; // built-in sections switched off
  custom?: CustomSec[];
};

// Texts the admin can change. "def" is exactly what the website shows today.
export const TEXT_FIELDS: { key: string; group: string; label: string; def: string; long?: boolean }[] = [
  { key: 'hero.badge', group: 'Top banner', label: 'Small badge above the headline', def: 'BDIX 10G DEDICATED DHAKA CLUSTER • ONLINE (12ms PING)' },
  { key: 'hero.btn1', group: 'Top banner', label: 'Green button text', def: 'Download iOS Profile' },
  { key: 'hero.btn2', group: 'Top banner', label: 'Blue button text', def: 'See rates' },
  { key: 'gen.tag', group: 'Profile downloader', label: 'Small tag', def: 'Automated Mobile Profile Setup' },
  { key: 'gen.title', group: 'Profile downloader', label: 'Title', def: 'iOS & Android Profile Downloader' },
  { key: 'gen.sub', group: 'Profile downloader', label: 'Text under the title', def: 'আপনার রিসেলারের দেওয়া টোকেন হোস্টনেমটি বসিয়ে ১-ক্লিকে ডাউনলোড করুন', long: true },
  { key: 'rates.tag', group: 'Package rates', label: 'Small tag', def: 'Expat Package Rates' },
  { key: 'rates.title', group: 'Package rates', label: 'Title', def: 'আমাদের প্রিমিয়াম প্যাকেজ রেট' },
  { key: 'setup.title', group: 'Setup guide', label: 'Title', def: '১০ সেকেন্ডে সহজ সেটআপ গাইড' },
  { key: 'res.tag', group: 'Reseller business', label: 'Small tag', def: 'Reseller Agency Network' },
  { key: 'res.title', group: 'Reseller business', label: 'Title', def: 'রিসেলার বিজনেস শুরু করুন (MaheHub)' },
  { key: 'res.btn', group: 'Reseller business', label: 'Login button text', def: 'MaheHub Seller Login' },
  { key: 'api.tag', group: 'Server / API connect', label: 'Small tag', def: 'Enterprise B2B Architecture' },
  { key: 'api.title', group: 'Server / API connect', label: 'Title', def: 'Connect Your Website or Server to MaheHub' },
];

export const DEFAULT_BRAND = { name: 'MAHEHUB.COM', tagline: 'Smart DNS & Residential VPN', logo: '/icon-512.png' };

const HEX = /^#[0-9a-f]{6}$/i;
const cleanColor = (v: unknown) => (typeof v === 'string' && HEX.test(v.trim()) ? v.trim().toLowerCase() : undefined);

export function safeUrl(u?: string): string {
  const v = String(u || '').trim();
  if (!v) return '';
  if (/^https:\/\/[^\s"'<>]+$/i.test(v)) return v;
  if (/^\/[^\s"'<>]*$/.test(v) && !v.startsWith('//')) return v;
  if (/^#[A-Za-z0-9_-]+$/.test(v)) return v;
  if (/^(mailto:|tel:)[^\s"'<>]+$/i.test(v)) return v;
  return '';
}

export function embedFor(url?: string): { kind: 'iframe' | 'video' | 'none'; src: string } {
  const u = safeUrl(url);
  if (!u) return { kind: 'none', src: '' };
  let m = u.match(/(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
  if (m) return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${m[1]}` };
  m = u.match(/vimeo\.com\/(?:video\/)?(\d{6,12})/i);
  if (m) return { kind: 'iframe', src: `https://player.vimeo.com/video/${m[1]}` };
  return { kind: 'video', src: u };
}

export function parseContent(raw?: string | null): SiteContent {
  if (!raw) return {};
  let j: any;
  try { j = JSON.parse(raw); } catch { return {}; }
  if (!j || typeof j !== 'object' || Array.isArray(j)) return {};
  const str = (v: unknown, n = 2000) => (typeof v === 'string' ? v.slice(0, n) : undefined);
  const out: SiteContent = { v: 1 };
  if (j.theme && typeof j.theme === 'object') {
    out.theme = {
      main: cleanColor(j.theme.main), green: cleanColor(j.theme.green), gold: cleanColor(j.theme.gold), blue: cleanColor(j.theme.blue),
      bg_dark: cleanColor(j.theme.bg_dark), bg_light: cleanColor(j.theme.bg_light),
      font: ['default', 'serif', 'rounded', 'mono'].includes(j.theme.font) ? j.theme.font : undefined,
    };
  }
  if (j.brand && typeof j.brand === 'object') out.brand = { name: str(j.brand.name, 60), tagline: str(j.brand.tagline, 100), logo: safeUrl(j.brand.logo) || undefined };
  if (j.hero && typeof j.hero === 'object') out.hero = { bg_image: safeUrl(j.hero.bg_image) || undefined, video: safeUrl(j.hero.video) || undefined, image: safeUrl(j.hero.image) || undefined };
  if (j.text && typeof j.text === 'object') {
    out.text = {};
    for (const f of TEXT_FIELDS) { const t = str(j.text[f.key], 600); if (t !== undefined && t.trim() !== '') out.text[f.key] = t; }
  }
  if (Array.isArray(j.order)) out.order = j.order.filter((x: unknown) => typeof x === 'string').slice(0, 60);
  if (Array.isArray(j.hidden)) out.hidden = j.hidden.filter((x: unknown) => typeof x === 'string').slice(0, 20);
  if (Array.isArray(j.custom)) {
    out.custom = j.custom.slice(0, 30).filter((c: any) => c && typeof c.id === 'string' && /^c[0-9]{1,6}$/.test(c.id)).map((c: any): CustomSec => ({
      id: c.id, kind: c.kind === 'gallery' ? 'gallery' : 'block',
      title: str(c.title, 200), text: str(c.text, 4000),
      image: safeUrl(c.image) || undefined, video: safeUrl(c.video) || undefined,
      button_text: str(c.button_text, 60), button_url: safeUrl(c.button_url) || undefined,
      layout: ['left', 'right', 'center'].includes(c.layout) ? c.layout : 'center', box: !!c.box,
      items: Array.isArray(c.items) ? c.items.slice(0, 24).map((it: any): MediaItem => ({ kind: it?.kind === 'video' ? 'video' : 'image', url: safeUrl(it?.url), caption: str(it?.caption, 200) })).filter((it: MediaItem) => it.url) : undefined,
    }));
  }
  return out;
}

export const tx = (sc: SiteContent, key: string, def: string) => (sc.text && sc.text[key]) || def;

// final top-to-bottom order of every section that exists (built-in ones that are not removed + custom ones)
export function orderedIds(sc: SiteContent): string[] {
  const customIds = (sc.custom || []).map((c) => c.id);
  const known = new Set<string>([...BUILTIN.map((b) => b.id), ...customIds]);
  const saved = (sc.order || []).filter((id) => known.has(id));
  const rest = BUILTIN.map((b) => b.id as string).filter((id) => !saved.includes(id) && !(sc.order && sc.order.length));
  // when nothing was saved yet, show all built-in sections in the original order; customs not in the list go last
  const missingCustom = customIds.filter((id) => !saved.includes(id));
  return [...saved, ...rest, ...missingCustom];
}

// ---------- theme ----------
function hexToRgb(h: string): [number, number, number] { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function mix(a: string, b: [number, number, number], t: number): string {
  const [r, g, bl] = hexToRgb(a);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${c(r, b[0])}${c(g, b[1])}${c(bl, b[2])}`;
}
const WHITE: [number, number, number] = [255, 255, 255];
const BLACK: [number, number, number] = [0, 0, 0];
// one colour -> a full 50..950 scale (500 is the colour itself)
function scale(hex: string): Record<string, string> {
  return {
    '50': mix(hex, WHITE, 0.92), '100': mix(hex, WHITE, 0.84), '200': mix(hex, WHITE, 0.68), '300': mix(hex, WHITE, 0.48), '400': mix(hex, WHITE, 0.24),
    '500': hex, '600': mix(hex, BLACK, 0.14), '700': mix(hex, BLACK, 0.3), '800': mix(hex, BLACK, 0.46), '900': mix(hex, BLACK, 0.6), '950': mix(hex, BLACK, 0.76),
  };
}
const FONTS: Record<string, string> = {
  serif: "Georgia, 'Times New Roman', 'Noto Serif Bengali', serif",
  rounded: "ui-rounded, 'Nunito', 'Segoe UI', system-ui, 'Noto Sans Bengali', sans-serif",
  mono: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
};

// CSS that re-colours the whole page. Tailwind 4 reads colours from CSS variables, so changing the variable
// changes every button, border and gradient that uses that colour family.
export function themeCss(t?: ThemeCfg): string {
  if (!t) return '';
  const r: string[] = [];
  const fam = (names: string[], hex?: string) => {
    if (!hex) return;
    const s = scale(hex);
    for (const n of names) for (const k of Object.keys(s)) r.push(`--color-${n}-${k}:${s[k]};`);
  };
  fam(['cyan', 'sky'], t.main);
  fam(['emerald', 'teal', 'green'], t.green);
  fam(['amber', 'yellow'], t.gold);
  fam(['blue'], t.blue);
  let css = r.length ? `:root{${r.join('')}}` : '';
  if (t.bg_dark) css += `.mh-root.mh-dark{background-color:${t.bg_dark}!important}`;
  if (t.bg_light) css += `.mh-root.mh-light{background-color:${t.bg_light}!important}`;
  if (t.font && FONTS[t.font]) css += `.mh-root,.mh-root button,.mh-root input,.mh-root select,.mh-root textarea{font-family:${FONTS[t.font]}!important}`;
  return css;
}

export const PRESETS: { name: string; theme: ThemeCfg }[] = [
  { name: 'Original (cyan)', theme: {} },
  { name: 'Royal purple', theme: { main: '#8b5cf6', green: '#10b981', gold: '#f59e0b', blue: '#6366f1', bg_dark: '#0d0a1f' } },
  { name: 'Ocean blue', theme: { main: '#0ea5e9', green: '#14b8a6', gold: '#f59e0b', blue: '#2563eb', bg_dark: '#06121f' } },
  { name: 'Fire red', theme: { main: '#ef4444', green: '#22c55e', gold: '#f59e0b', blue: '#e11d48', bg_dark: '#1a0b0d' } },
  { name: 'Black & gold', theme: { main: '#eab308', green: '#22c55e', gold: '#f59e0b', blue: '#ca8a04', bg_dark: '#0a0a0a' } },
  { name: 'Forest green', theme: { main: '#22c55e', green: '#16a34a', gold: '#eab308', blue: '#0d9488', bg_dark: '#061a12' } },
];
