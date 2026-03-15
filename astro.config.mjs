import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://tristan-reig.github.io',
  base: '/Portfolio',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  }
});