import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';

export default {
  output: 'server',
  adapter: cloudflare({}),
  integrations: [tailwind({ applyBaseStyles: false })],
  vite: {
    build: { assetsInlineLimit: 0 }
  }
};
