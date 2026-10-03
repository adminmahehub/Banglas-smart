import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'MaheHub - Smart DNS & Expat Mobile Banking Portal',
  description: 'Native Zero-App Smart DNS and iOS mobileconfig profile provider enabling overseas Bangladeshis to use bKash, Nagad, Rocket, Upay, and Alaap seamlessly worldwide.',
  openGraph: {
    title: 'MaheHub - Smart DNS & Expat Mobile Banking Portal',
    description: 'Native Zero-App Smart DNS and iOS mobileconfig profile provider enabling overseas Bangladeshis to use bKash, Nagad, Rocket, Upay, and Alaap seamlessly worldwide.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MaheHub - Smart DNS & Expat Mobile Banking Portal',
    description: 'Native Zero-App Smart DNS and iOS mobileconfig profile provider enabling overseas Bangladeshis to use bKash, Nagad, Rocket, Upay, and Alaap seamlessly worldwide.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
