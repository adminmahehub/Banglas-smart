# Hostinger subdomain par upload (static)

1. Computer par: `npm install` phir `npm run build`  -> `out/` folder banega
2. Hostinger hPanel -> Domains -> Subdomains -> naya subdomain (e.g. panel.clientdomain.com)
3. File Manager -> us subdomain ka `public_html` -> `out/` ke ANDAR ki saari files upload karein
4. SSL: hPanel -> SSL -> subdomain par free SSL on karein

Note: yeh sirf frontend (demo data) hai. Asli VPN servers aur login baad mein Supabase se judenge.

## Supabase
Project: MaheHub Panel. URL/publishable key lib/supabase.ts mein hain (public key, safe).
Hosting par `NEXT_PUBLIC_SUPABASE_URL` aur `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` build se pehle set kar sakte hain (optional).

## VPN server (OpenVPN) - auto install
Run one command on the server as root (the one-line installer is served by the `vpn-setup` Supabase function):
`curl -fsSL "https://<project>.supabase.co/functions/v1/vpn-setup?code=<CODE>" | bash`
This installs OpenVPN without prompts and starts the provisioning API (port 18443) plus the per-minute sync.
Do NOT put the `server/` or `supabase/` folders in public_html; upload only the contents of `out/`.
The reseller panel Download button fetches a real .ovpn through the Supabase function `vpn-provision`.

## Automatic lifecycle (server side, every minute)
Suspend/Delete -> certificate revoked (immediately from the panel, otherwise by the server's sync).
Expiry or bandwidth used up -> status becomes 'expired' and the certificate is revoked.
Usage (used_mb) is read from OpenVPN's status.log and sent to the `vpn-sync` function.
After Renew/Active, the next Download issues a new certificate.
