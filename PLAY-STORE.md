# MaheHub on Google Play: listing and checklist

Package name: `com.mahehub.app` (cannot be changed after the first upload). Release builds come from GitHub Actions, "Build mobile app".

## Links to enter in Play Console
- Website: https://smartdns.mahehub.com
- Privacy policy: https://smartdns.mahehub.com/privacy/
- Account deletion page: https://smartdns.mahehub.com/account-deletion/
- Support email: b2b@mahehub.com

## Store listing text
**App name (30 max):** MaheHub Smart DNS

**Short description (80 max):**
Manage your MaheHub Smart DNS account, set it up and get help in one place.

**Full description:**
MaheHub is the account app for MaheHub Smart DNS, made for Bangladeshis living in Saudi Arabia, Malaysia and the Gulf.

With the app you can:
• Log in with your phone number and customer ID, or with your personal link
• Start a free trial
• See your plan status and how many days are left
• Follow the short setup steps for your phone
• Activate your current Wi-Fi or mobile data connection
• Contact MaheHub support on WhatsApp in Bangla or English
• See current plan rates and order through WhatsApp
• Resellers: open the reseller panel to manage their customers

Your account works on one phone only, so a shared login cannot be passed around.

MaheHub does not show ads and does not sell your information. Read the privacy policy at smartdns.mahehub.com/privacy.

**Category:** Tools   **Contains ads:** No

## Wording to avoid in the listing and screenshots
Do not use "unblock", "bypass", "hide your IP", "VPN" or claims that the app gets around restrictions. Describe the app as an account and setup app.

## Graphic assets (in the zip, folder `play-store/`)
- App icon 512x512: `icon-512.png`
- Feature graphic 1024x500: `feature-graphic-1024x500.png`
- Phone screenshots 1080x1920 (min 2, max 8): `phone-screenshot-1..6.png`. They show demo data in the real app screens.

## Play Console forms (the client fills these)
- **App access:** reviewers need a way in. Give a working test account: a phone number and customer ID, or a personal link, that stays active during review.
- **Data safety** (answers that match the privacy policy):
  - Collected: name, phone number (Personal info); the phone's device identifier and the IP address of the connection (Device or other IDs: confirm in the form which group Play puts the IP in).
  - Purpose: app functionality, account management, fraud prevention and security.
  - Shared with third parties: No. (Supabase stores the data for us as our service provider.)
  - Encrypted in transit: Yes.
  - Users can request deletion: Yes. URL: https://smartdns.mahehub.com/account-deletion/
- **Content rating:** answer the questionnaire honestly (no violence, no user-to-user chat, no purchases inside the app).
- **Target audience:** 18 and over.
- **Ads:** none.
- **Government / news / health / financial apps:** answer No. The app does not handle payments.
- **Play App Signing:** keep ON. Upload the AAB signed with the upload key from the repository secrets.
- New personal developer accounts must run a closed test (about 12 testers for 14 days) before applying for production. Organisation accounts do not. Check the current rule in Play Console.

## Release signing (GitHub secrets, once)
Settings > Secrets and variables > Actions > New repository secret, four secrets:
`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.
Then run "Build mobile app". The artifact `mahehub-android` contains the signed `.aab` for Play Console. Keep the keystore file safe.

## After the first upload
1. Play Console > App integrity > copy the **App signing key SHA-256**.
2. Paste it in `public/.well-known/assetlinks.json` (replace `REPLACE_WITH_SHA256_FROM_PLAY_CONSOLE_APP_SIGNING`) and redeploy the website.
3. Each new release needs a higher version code. The workflow sets it from the run number.
