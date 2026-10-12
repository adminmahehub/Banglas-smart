import type { Metadata } from 'next';

// Private page: keep it out of Google and other search engines.
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
};

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
