import ENVS from './env';
import { defineConfig } from '@umijs/max';

const RUN_ENV = process.env.RUN_ENV ?? 'prod';
const envs = ENVS[RUN_ENV];

console.log(`
  net env: ${envs['process.env.NET_ENV']}
  run env: ${RUN_ENV}
`);

/**
 * 生产环境配置
 */
export default defineConfig({
  define: {
    'process.env.RUN_ENV': RUN_ENV,
    ...envs,
  },
});
