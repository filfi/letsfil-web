import { defineConfig } from '@umijs/max';

type IConfig = Parameters<typeof defineConfig>[0];
type OmitType<T, U> = T extends U ? never : T;
type ProxyOptions = Required<IConfig>['proxy'];
type Options = OmitType<ProxyOptions, unknown[]>;

const proxies: Record<string, Options> = {
  // hyperspace testnet
  hp: {
    '/api': {
      target: 'http://10.100.244.100:8888',
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
    },
    '/rpc': {
      target: 'https://api.hyperspace.node.glif.io',
      changeOrigin: true,
    },
  },
  // 2k testnet
  '2k': {
    '/api': {
      target: 'http://10.100.244.100:7777',
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
    },
    '/rpc': {
      target: 'https://api.hyperspace.node.glif.io',
      changeOrigin: true,
    },
  },
};

export default proxies;
