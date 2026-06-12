import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.davidsanchez.vivopromotor',
  appName: 'Vivo Promotor',
  webDir: 'out',
  android: {
    allowMixedContent: false,
  },
};

export default config;
