import { defineConfig } from '@umijs/max';

import proxies from './proxy';

const RUN_ENV = process.env.RUN_ENV ?? 'hp';

export default defineConfig({
  define: {
    'process.env': {
      API_URL: process.env.API_URL ?? '/api',
      RPC_URL: process.env.RPC_URL ?? '/rpc',
      RUN_ENV: process.env.RUN_ENV,
    },
  },

  proxy: proxies[RUN_ENV],
});
