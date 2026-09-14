import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const localApiPort = Number(env.LOCAL_API_PORT ?? 8787);

  if (!Number.isInteger(localApiPort) || localApiPort < 1 || localApiPort > 65_535) {
    throw new Error('LOCAL_API_PORT deve ser um inteiro entre 1 e 65535.');
  }

  const localApiTarget = `http://127.0.0.1:${localApiPort}`;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': localApiTarget,
      },
    },
    preview: {
      proxy: {
        '/api': localApiTarget,
      },
    },
  };
});
