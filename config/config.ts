import { defineConfig } from '@umijs/max';

import routes from './routes';

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
  routes,

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
  links: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter&display=swap',
    },
  ],
});
