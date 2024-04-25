import { defineConfig } from '@umijs/max';

import routes from './routes';

export default defineConfig({
  define: {
    'process.env.API_URL': '/api',
    'process.env.RPC_URL': '/rpc',
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
  hash: true,
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
  links: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter&display=swap',
    },
  ],
});
