import type { Metadata } from 'next';

const TITLE = 'Become a MaheHub Reseller - Smart DNS & VPN Credits';
const DESC =
  'Buy credits and sell Smart DNS and VPN accounts to your own customers. See reseller rates, create your reseller account and manage customers from one panel.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: { canonical: '/reseller/' },
  openGraph: { title: TITLE, description: DESC, url: '/reseller/', type: 'website', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESC, images: ['/og-image.png'] },
};

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
