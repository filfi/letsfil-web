declare namespace NodeJS {
  type Address = `0x${string}`;

  interface Process {
    env: Dict<string> & {
      /**
       * Filecoin网络
       *   `main` 主网
       *   `test` 测试网络
       */
      NET_ENV: 'main' | 'test';

      /**
       * 部署环境
       */
      RUN_ENV: 'sim' | 'sit' | 'pet' | 'peb';

      API_URL: string;

      RPC_URL: string;

      /**
       * 工厂合约地址
       */
      ADDR_FACTORY: Address;

      /**
       * sFil通证合约地址
       */
      ADDR_AFIL: Address;

      /**
       * sFil借贷合约地址
       */
      ADDR_LOAN: Address;

      /**
       * Retriever合约地址
       */
      ADDR_RETRIEVER: Address;
    };
  }
}
