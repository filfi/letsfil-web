import '@umijs/max/typings';
import { BigNumberish } from 'ethers';

declare global {
  interface Window {
    ethereum?: Record<string, any>;
  }

  interface MetaMaskEthereumProvider {
    isMetaMask?: boolean;
    once(eventName: string | symbol, listener: (...args: any[]) => void): this;
    on(eventName: string | symbol, listener: (...args: any[]) => void): this;
    off(eventName: string | symbol, listener: (...args: any[]) => void): this;
    addListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
  }

  type MaybeRef<T> = T | React.MutableRefObject<T>;

  interface TxOptions {
    gas?: BigNumberish;
    gasLimit?: BigNumberish;
    gasPrice?: BigNumberish;
    maxFeePerGas?: ethers.BigNumber;
    maxPriorityFeePerGas?: BigNumberish;
    value?: BigNumberish;
  }

  /**
   * 募集计划信息
   */
  interface RaiseInfo {
    /**
     * 募集ID，合约内递增唯一标识
     */
    id: BigNumberish;
    /**
     * 募集目标
     */
    targetAmount: BigNumberish;
    /**
     * 募集保证金
     */
    securityFund: BigNumberish;
    /**
     * 保证金比例 100以内的数字，10 -> 10%
     */
    securityFundRate: BigNumberish;
    /**
     * 募集截止时间，秒时间戳
     */
    deadline: BigNumberish;
    /**
     * 募集者权益 100以内的数字，10 -> 10%
     */
    raiserShare: BigNumberish;
    /**
     * 投资者权益 100以内的数字，10 -> 10%
     */
    investorShare: BigNumberish;
    /**
     * 服务商权益 100以内的数字，10 -> 10%
     */
    servicerShare: BigNumberish;
    /**
     * 发起账户
     */
    sponsor: string;
    /**
     * 发起单位
     */
    raiseCompany: string;
    /**
     * 服务商ID
     */
    companyId: BigNumberish;
    /**
     * 服务商签名地址
     */
    spAddress: string;
  }

  /**
   * 节点信息
   */
  interface NodeInfo {
    /**
     * Miner ID
     */
    minerID: BigNumberish;
    /**
     * 节点大小   1073741824 = 1GiB = 1024MiB = 1024*1024KiB = 1024*1024*1024 byte
     */
    nodeSize: BigNumberish;
    /**
     * 扇区大小   1073741824 = 1GiB = 1024MiB = 1024*1024KiB = 1024*1024*1024 byte
     */
    sectorSize: BigNumberish;
    /**
     * 封装周期 秒数
     */
    sealPeriod: BigNumberish;
    /**
     * 运行周期 秒数
     */
    nodePeriod: BigNumberish;
    /**
     * 真实封装数量
     */
    realSealAmount: BigNumberish;
    /**
     * 运维保证金
     */
    opsSecurityFund: BigNumberish;
    /**
     * 缴纳运维保证金地址
     */
    opsSecurityFundPayer: string;
  }

  /**
   * 拓展信息
   */
  interface ExtraInfo {
    /**
     * 最小募集比例
     */
    minRaiseRate: BigNumberish;
  }
}
