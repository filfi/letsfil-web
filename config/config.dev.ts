import { defineConfig } from '@umijs/max';

import proxies from './proxy';

const RUN_ENV = process.env.RUN_ENV ?? 'test';

export default defineConfig({
  define: {
    'process.env': {
      API_URL: process.env.API_URL,
      RPC_URL: process.env.RPC_URL,
      RUN_ENV: process.env.RUN_ENV,
      ADDRESS: process.env.ADDRESS,
    },
  },

  proxy: proxies[RUN_ENV],
});
