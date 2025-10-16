import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,md,mdx,svelte,ts,tsx,vue}',
    join(__dirname, 'node_modules/@astrojs/tailwind/**/*.{js,mjs}')
  ],
  theme: {
    extend: {
      colors: {
        surface: '#ffffff',
        background: '#f7f9fc',
        primary: {
          DEFAULT: '#2152ff',
          dark: '#0d1c5a'
        },
        muted: '#475569',
        border: '#e2e8f0'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      }
    }
  }
};
