# MaheHub mobile app (Android + iOS)

Same repo, two builds:
- Website: `npm run build` (unchanged) -> Hostinger.
- App: `npm run build:app` (sets NEXT_PUBLIC_APP_MODE=native) -> bundled into the Android/iOS app by Capacitor.

## Build in GitHub (no Android Studio / Mac needed)
Actions -> "Build mobile app" -> Run workflow. Download `mahehub-android` (debug APK to test, AAB for Play Store).

### Android release signing (once)
Create a keystore and keep it safe FOREVER (losing it = cannot update the app):
`keytool -genkey -v -keystore release.jks -alias mahehub -keyalg RSA -keysize 2048 -validity 10000`
GitHub -> Settings -> Secrets: ANDROID_KEYSTORE_BASE64 (`base64 -w0 release.jks`), ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD.
Use Play App Signing when you upload the first AAB.

### Tap-a-link-opens-the-app
1. Play Console -> App integrity -> copy the App signing SHA-256 -> paste into `public/.well-known/assetlinks.json`.
2. iOS: put your Apple Team ID in `public/.well-known/apple-app-site-association`.
3. Rebuild + upload the website to Hostinger. Check https://smartdns.mahehub.com/.well-known/assetlinks.json opens.

### iOS (needs Apple Developer account, $99/year)
The workflow only proves it compiles. For TestFlight/App Store add an Apple signing step (certificate + provisioning profile secrets) or archive once from a Mac: `npx cap open ios`.

## Check before release
- The Supabase functions dns-portal, dns-activate, dns-wg must answer cross-origin requests (Access-Control-Allow-Origin: *), because the app runs from https://localhost (Android) / capacitor://localhost (iOS). dns-wg already does; check the other two.
- Play listing: avoid "unblock/bypass/VPN" wording. App Store: plans/ordering screen is hidden on iOS on purpose (Apple in-app purchase rule).
- Reseller panel opens the website in the phone browser (phase 2: native reseller screens).
