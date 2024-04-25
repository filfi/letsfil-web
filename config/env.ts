export default {
  sim: {
    // 3000
    /**
     * 网络环境 test(测试网) | main(主网)
     */
    'process.env.NET_ENV': 'test',
    /**
     * 工厂合约地址
     */
    'process.env.ADDR_FACTORY': '0xA092C73D2ffF44FBafE5E72a1650A9A1a4487103',
    /**
     * aFil合约地址
     */
    'process.env.ADDR_AFIL': '0x811BECB35CC6256aE8f0f504ee1a77cDf49d39d8',
    /**
     * 借贷合约地址
     */
    'process.env.ADDR_LOAN': '0x2f473cd5f911E2B4880c3d91Df973ed20387812d',
    /**
     * Retriever合约地址
     */
    'process.env.ADDR_RETRIEVER': '0x7C398A95a3b2c38a3Afa47a54C0c2AD45A37bFBf',
  },
  sin: {
    // 3001
    // 网络环境  main | test
    'process.env.NET_ENV': 'test',
    /**
     * 工厂合约地址
     */
    'process.env.ADDR_FACTORY': '0xC2485251c03CC05E68EE5F2444e819E35Aaff9db',
    /**
     * aFil合约地址
     */
    'process.env.ADDR_AFIL': '0x7976a4a3b43055f56A427D20A29F45ec11D74Ecd',
    /**
     * 借贷合约地址
     */
    'process.env.ADDR_LOAN': '0x1a6C1205f6B93CD60A9FBc313F14219E913225AE',
    /**
     * Retriever合约地址
     */
    'process.env.ADDR_RETRIEVER': '0xeE51e1ee443BAB7a70ABc893D34eBBBE6d9b7655',
  },
  sit: {
    // 5000
    // 网络环境  main | test
    'process.env.NET_ENV': 'test',
    /**
     * 工厂合约地址
     */
    'process.env.ADDR_FACTORY': '0xe80Ecf29986f6b18Dad270A40Cf0E8DB1028A6bA',
    /**
     * aFil合约地址
     */
    'process.env.ADDR_AFIL': '0x01F5e5dC4ec5623ae865f31B324A718bA16B439e',
    /**
     * 借贷合约地址
     */
    'process.env.ADDR_LOAN': '0xfd104c1b244619A906C1594081602da96ff1627A',
    /**
     * Retriever合约地址
     */
    'process.env.ADDR_RETRIEVER': '0x39CDca1AB9B553D42ff644Be0425475ED68a3B90',
  },
  pet: {
    // 5200
    /**
     * 网络环境 test(测试网) | main(主网)
     */
    'process.env.NET_ENV': 'test',
    /**
     * 工厂合约地址
     */
    'process.env.ADDR_FACTORY': '0xbcae4ea09FE1E670742846C9852Edcc1D6679870',
    /**
     * aFil合约地址
     */
    'process.env.ADDR_AFIL': '0x3a27C6BC7Ced86ADcBba808D5891267674FC024d',
    /**
     * 借贷合约地址
     */
    'process.env.ADDR_LOAN': '0x5dd7Fbf9823d9D2F73DDA770C187703Fa5Be6f39',
    /**
     * Retriever合约地址
     */
    'process.env.ADDR_RETRIEVER': '0x9b3Eff8a2aAC9Bf8c146603F33e585d6410ae41e',
  },
  peb: {
    // 5300
    /**
     * 网络环境 test(测试网) | main(主网)
     */
    'process.env.NET_ENV': 'test',
    /**
     * 工厂合约地址
     */
    'process.env.ADDR_FACTORY': '0x05300F8520D347eB211028F60f83eB0709F2FdeC',
    /**
     * aFil合约地址
     */
    'process.env.ADDR_AFIL': '0xc473a56A2A8eCE23F93A9389F4Aae668286243F3',
    /**
     * 借贷合约地址
     */
    'process.env.ADDR_LOAN': '0x45cE6f729cf5C3A5E6169c9874aAB083A617e159',
    /**
     * Retriever合约地址
     */
    'process.env.ADDR_RETRIEVER': '0x76B688c65121c62E848C0CBC18A8cB7199c45492',
  },
  prod: {
    // prod
    /**
     * 网络环境 test(测试网) | main(主网)
     */
    'process.env.NET_ENV': 'main',
    /**
     * 工厂合约地址
     */
    'process.env.ADDR_FACTORY': process.env.ADDRESS ?? process.env.ADDR_FACTORY ?? '',
    /**
     * aFil合约地址
     */
    'process.env.ADDR_AFIL': '0x0D36637e7f1e35FC8845a842F3A8B0Dc0515a414',
    /**
     * 借贷合约地址
     */
    'process.env.ADDR_LOAN': '0x5B27dd8F78Ec1f14891Da2A41E0bF58150E03124',
    /**
     * Retriever合约地址
     */
    'process.env.ADDR_RETRIEVER': '0xf0C7D3c09620893765ae9c580F51Cd9a8D703281',
  },
};
