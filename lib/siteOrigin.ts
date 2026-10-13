// In the mobile app the page origin is https://localhost, so links given to customers must use the real site.
export function siteOrigin(): string {
  if (process.env.NEXT_PUBLIC_APP_MODE === 'native') return 'https://smartdns.mahehub.com';
  return typeof window !== 'undefined' ? window.location.origin : '';
}
