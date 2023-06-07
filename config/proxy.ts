import { defineConfig } from '@umijs/max';

type IConfig = Parameters<typeof defineConfig>[0];
type OmitType<T, U> = T extends U ? never : T;
type ProxyOptions = Required<IConfig>['proxy'];
type Options = OmitType<ProxyOptions, unknown[]>;

const proxies: Record<string, Options> = {
  // test - hyperspace testnet
  test: {
    '/api': {
      // target: 'http://10.100.244.100:9999',
      // target: 'http://10.100.244.100:7777',
      // target: 'http://10.100.244.100:8888', // miner
      target: 'https://job.mining.filfi.io', // prod
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
  // local - 2k testnet
  local: {
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
