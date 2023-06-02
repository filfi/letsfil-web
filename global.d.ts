import '@umijs/max/typings';
import type { BigNumber, BigNumberish } from 'ethers';

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
     * 最小募集比例 1000 -> 10%
     */
    minRaiseRate: BigNumberish;
    /**
     * 募集保证金
     */
    securityFund: BigNumberish;
    /**
     * 募集天数 单位天
     */
    raiseDays: BigNumberish;
    /**
     * 募集者权益 1000 -> 10%
     */
    raiserShare: BigNumberish;
    /**
     * 运维保证金权益比例 350 -> 3.5%
     */
    spFundShare: BigNumberish;
    /**
     * 投资者权益 1000 -> 10%
     */
    investorShare: BigNumberish;
    /**
     * 服务商权益 1000 -> 10%
     */
    servicerShare: BigNumberish;
    /**
     * FilFi协议权益 1000 -> 10%
     */
    filFiShare: BigNumberish;
    /**
     * 发起账户
     */
    sponsor: string;
    /**
     * 发起单位
     */
    raiseCompany: string;
  }

  /**
   * 节点信息
   */
  interface NodeInfo {
    /**
     * Miner ID
     */
    minerId: BigNumberish;
    /**
     * 节点大小   1073741824 = 1GiB = 1024MiB = 1024*1024KiB = 1024*1024*1024 byte
     */
    nodeSize: BigNumberish;
    /**
     * 扇区大小   284982949，单位bytes
     */
    sectorSize: BigNumberish;
    /**
     * 封装周期 天
     */
    sealDays: BigNumberish;
    /**
     * 运行周期 天
     */
    nodeDays: BigNumberish;
    /**
     * 运维保证金
     */
    opsSecurityFund: BigNumberish;
    /**
     * 服务商钱包地址
     */
    spAddr: string;
    /**
     * 发起单位id
     */
    companyId: BigNumberish;
  }

  /**
   * 拓展信息
   */
  interface ExtraInfo {
    /**
     * CC转DC旧资产包id,没有则传0
     */
    oldId: BigNumberish;
    /**
     * 旧资产包中发起人的质押币分配比例，8000表示80%
     */
    raiserOldShare: BigNumberish;
    /**
     * 旧资产包中服务商的质押币分配比例，8000表示80%
     */
    spOldShare: BigNumberish;
    /**
     * 旧资产包中发起人的收益分配比例，8000表示80%
     */
    sponsorOldRewardShare: BigNumberish;
    /**
     * 旧资产包中服务商的收益分配比例，8000表示80%
     */
    spOldRewardShare: BigNumberish;
  }

  /**
   * 投资人信息
   */
  interface InvestorInfo {
    /**
     * 账户余额
     */
    pledgeAmount: BigNumber;
    /**
     * 投资总额
     */
    pledgeCalcAmount: BigNumber;
    /**
     * 已提取金额
     */
    withdrawAmount: BigNumber;
  }
}
