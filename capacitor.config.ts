import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'py.coop.agronorte',
  appName: 'Coop Agronorte',
  webDir: 'dist',
  backgroundColor: '#071e19',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#071e19'
  }
};

export default config;
