import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        'character-create': resolve(import.meta.dirname, 'src/character-create.ts'),
        'character-edit': resolve(import.meta.dirname, 'src/character-edit.ts'),
        'character-list': resolve(import.meta.dirname, 'src/character-list.ts'),
        'recent-battles': resolve(import.meta.dirname, 'src/recent-battles.ts')
      },
      formats: ['es'],
      cssFileName: 'agentduel-deathmode'
    },
    rollupOptions: {
      external: [
        'i18next',
        'react',
        'react-dom',
        'react-i18next',
        'react/jsx-runtime'
      ],
      output: {
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: '[name].js'
      }
    },
    sourcemap: true
  }
});
