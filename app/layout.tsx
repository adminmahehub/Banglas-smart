import type { Metadata, Viewport } from 'next';
import './globals.css'; // Global styles

const SITE = 'https://smartdns.mahehub.com';
const TITLE = 'MaheHub - Smart DNS for bKash, Nagad, Rocket & Upay Abroad';
const DESC =
  'MaheHub gives overseas Bangladeshis Smart DNS and VPN access to use bKash, Nagad, Rocket, Upay and other Bangladeshi apps from abroad. Start with a free trial. No app is needed on iPhone.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: '%s | MaheHub' },
  description: DESC,
  applicationName: 'MaheHub',
  keywords: [
    'Smart DNS Bangladesh', 'bKash abroad', 'Nagad abroad', 'Rocket Upay abroad',
    'Bangladesh VPN', 'Bangladeshi apps from abroad', 'MaheHub', 'DNS reseller',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: SITE,
    siteName: 'MaheHub',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MaheHub Smart DNS and VPN for overseas Bangladeshis' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
    images: ['/og-image.png'],
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#050b1a',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': `${SITE}/#org`, name: 'MaheHub', url: SITE, logo: `${SITE}/apple-touch-icon.png` },
    { '@type': 'WebSite', '@id': `${SITE}/#website`, url: SITE, name: 'MaheHub', inLanguage: 'en', publisher: { '@id': `${SITE}/#org` } },
    {
      '@type': 'Service',
      '@id': `${SITE}/#service`,
      name: 'MaheHub Smart DNS',
      serviceType: 'Smart DNS and VPN for overseas Bangladeshis',
      description: DESC,
      areaServed: 'Worldwide',
      provider: { '@id': `${SITE}/#org` },
      url: SITE,
    },
  ],
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
