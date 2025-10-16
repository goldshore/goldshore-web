import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://goldshore.org',
  integrations: [
    tailwind({
      applyBaseStyles: false
    })
  ]
});
