import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sumeeth.nutrifit',
  appName: 'NutriFit',
  webDir: 'dist',
  server: {
    url: 'https://nutri-fit-v1.lovable.app',
    cleartext: false
  }
};

export default config;
