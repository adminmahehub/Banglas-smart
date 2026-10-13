import type { CapacitorConfig } from '@capacitor/cli';

// The app bundles the static export (out/) built with NEXT_PUBLIC_APP_MODE=native. No website is loaded.
const config: CapacitorConfig = {
  appId: 'com.mahehub.app',
  appName: 'MaheHub',
  webDir: 'out',
  backgroundColor: '#0c1226',
  android: { allowMixedContent: false },
  plugins: {
    SplashScreen: { launchAutoHide: false, backgroundColor: '#0c1226', showSpinner: false },
    StatusBar: { style: 'DARK', backgroundColor: '#0c1226' },
  },
};

export default config;
