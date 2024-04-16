import { defineConfig } from '@umijs/max';

import { emergencyRoutes, commonRoutes } from './routes';

const EMERGENCY_DRILL = ['yes', 'on', 'true', '1'].includes(process.env.EMERGENCY_DRILL ?? '');

export default defineConfig({
  define: {
    'process.env': {
      API_URL: process.env.API_URL,
      RPC_URL: process.env.RPC_URL,
      RUN_ENV: process.env.RUN_ENV,
      ADDRESS: process.env.ADDRESS,
    },
  },

  antd: {},

  // routes
  routes: EMERGENCY_DRILL ? emergencyRoutes : commonRoutes,

  model: {},
  access: {},
  // valtio 数据流
  valtio: {},
  deadCode: {},
  layout: false,
  locale: {
    title: true,
    default: 'zh-CN',
    useLocalStorage: true,
  },
  request: {},
  title: 'FilFi',
  initialState: {},
  moment2dayjs: {},
  cssLoaderModules: {
    exportLocalsConvention: 'camelCase',
  },
  jsMinifierOptions: {
    target: 'es2020',
  },
  svgo: {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false,
          },
        },
      },
    ],
  },
  npmClient: 'pnpm',
  copy: ['_headers'],
});
