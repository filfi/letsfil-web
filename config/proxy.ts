import { defineConfig } from '@umijs/max';

type IConfig = Parameters<typeof defineConfig>[0];
type OmitType<T, U> = (T extends U ? never : T);
type ProxyOptions = Required<IConfig>['proxy'];
type Options = OmitType<ProxyOptions, unknown[]>;

const options: Options = {
  '/api': {
    target: 'http://10.100.244.100:7777',
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      '^/api': '',
    },
  },
};

export default options;
