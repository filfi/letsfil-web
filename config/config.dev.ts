import { defineConfig } from '@umijs/max';

import proxy from './proxy';

export default defineConfig({
  define: {
    'process.env': {
      API_URL: process.env.API_URL ?? '/api',
    },
  },

  proxy,
});
