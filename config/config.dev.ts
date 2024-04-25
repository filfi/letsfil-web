import ENVS from './env';
import { defineConfig } from '@umijs/max';

const RUN_ENV = process.env.RUN_ENV ?? 'sit';
const envs = ENVS[RUN_ENV];

console.log(`
  net env: ${envs['process.env.NET_ENV']}
  run env: ${RUN_ENV}
`);

/**
 * dev开发环境配置
 */
export default defineConfig({
  define: {
    'process.env.RUN_ENV': RUN_ENV,
    ...envs,
  },

  proxy: {
    '/api': {
      // target: 'http://10.100.244.100:9999', // 3000
      // target: 'http://10.100.244.100:7777', // 5200
      // target: 'http://10.100.244.100:10000', // 5300
      target: 'http://10.100.244.100:8888', // 5000 miner
      // target: 'https://job.mining.filfi.io', // prod;
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
    },
    '/rpc': {
      // target: 'https://api.hyperspace.node.glif.io',
      target: 'https://api.calibration.node.glif.io',
      secure: false,
      changeOrigin: true,
    },
  },
});
