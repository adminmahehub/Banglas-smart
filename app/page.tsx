import MaheHubApp from '../components/MaheHubApp';

// NEXT_PUBLIC_APP_MODE=native is set only by `npm run build:app` (Android/iOS app).
// The website build replaces this with `false`, so the native app code is dropped and never reaches the website bundle.
export default function Page() {
  if (process.env.NEXT_PUBLIC_APP_MODE === 'native') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const NativeApp = require('../components/native/NativeApp').default;
    return <NativeApp />;
  }
  return <MaheHubApp initialView="store" />;
}
