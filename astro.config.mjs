// @ts-check
import { defineConfig } from 'astro/config';

import node from '@astrojs/node';

import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  adapter: node({
    mode: 'standalone'
  }),

  output: "server",
  integrations: [icon()]
});