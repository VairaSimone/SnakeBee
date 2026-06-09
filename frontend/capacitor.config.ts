import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'it.snakebee', // Sostituisci con il tuo App ID
  appName: 'SnakeBee',
  webDir: 'build', // O la tua cartella di output
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '703775532883-ljf7h6mrqvognf4v5qs0h6iopl3t4u4f.apps.googleusercontent.com', // Da Google Cloud Console
      forceCodeForRefreshToken: true,
    },
    CapacitorHttp: {
      enabled: true, // Questo forza le chiamate a passare per il lato nativo!
    },
  },
};
export default config;