import EventEmitter from 'eventemitter3';
import ethers, { BigNumber } from 'ethers';
import MetaMaskOboarding from '@metamask/onboarding';
import type { BigNumberish } from 'ethers';

import abi from '@/abis/raise.abi.json';
import { NodeState, RaiseState } from '@/constants/state';

export type ControllerEvents = {
  // 质押
  onStaking(data: { id: BigNumber; from: string; to: string; amount: BigNumber }): void;
  // 启动封装
  onStartSeal(data: { id: BigNumber; sender: string; time: BigNumber }): void;
  // 解除质押
  onUnstaking(data: { id: BigNumber; from: string; to: string; amount: BigNumber }): void;
  // 节点结束
  onDestroyNode(data: { id: BigNumber; state: NodeState }): void;
  // 募集失败
  onRaiseFailed(data: { id: BigNumber }): void;
  // 运维保证金缴纳
  onDepositRaiseFund(data: { id: BigNumber; sender: string; amount: BigNumber }): void;
  // 运维保证金缴纳
  onDepositOpsFund(data: { id: BigNumber; sender: string; amount: BigNumber }): void;
  // 服务商已签名
  onServicerSigned(data: { sender: string; minerId: number; contract: string }): void;
  // 募集计划启动
  onStartRaisePlan(data: { id: BigNumber; sender: string; time: BigNumber }): void;
  // 关闭募集计划
  onCloseRaisePlan(data: { id: BigNumber; address: string; time: BigNumber }): void;
  // 募集商提取收益
  onRaiserWithdraw(data: { id: BigNumber; from: string; to: string; amount: BigNumber }): void;
  // 服务商提取收益
  onServicerWithdraw(data: { id: BigNumber; from: string; to: string; amount: BigNumber }): void;
  // 投资人提取收益
  onInvestorWithdraw(data: { id: BigNumber; from: string; to: string; amount: BigNumber }): void;
  // 提取运维保证金
  onWithdrawOpsFund(data: { id: BigNumber; sender: string; amount: BigNumber }): void;
  // 提取募集保证金
  onWithdrawRaiseFund(data: { id: BigNumber; sender: string; amount: BigNumber }): void;
  // 节点状态变更
  onNodeStateChange(data: { id: BigNumber; state: NodeState }): void;
  // 募集计划状态变更
  onRaiseStateChange(data: { id: BigNumber; state: RaiseState }): void;
};

type Param<T extends (...args: any) => any> = Parameters<T>[0];
type SP<K extends keyof ControllerEvents> = keyof Param<ControllerEvents[K]>;

enum ContractEvents {
  onStaking = 'Staking',
  onStartSeal = 'StartSeal',
  onUnstaking = 'Unstaking',
  onDestroyNode = 'DestroyNode',
  onRaiseFailed = 'RaiseFailed',
  onCloseRaisePlan = 'CloseRaisePlan',
  onServicerSigned = 'SpSignWithMiner',
  onStartRaisePlan = 'StartRaisePlan',
  onDepositOpsFund = 'DepositOpsSecurityFund',
  onDepositRaiseFund = 'DepositSecurityFund',
  onWithdrawOpsFund = 'WithdrawOpsSecurityFund',
  onWithdrawRaiseFund = 'WithdrawSecurityFund',
  onRaiserWithdraw = 'RaiseWithdraw',
  onServicerWithdraw = 'SpWithdraw',
  onInvestorWithdraw = 'InvestorWithdraw',
  onNodeStateChange = 'NodeStateChange',
  onRaiseStateChange = 'RaiseStateChange',
}

function createContract(address?: string) {
  if (address && MetaMaskOboarding.isMetaMaskInstalled()) {
    const provider = new ethers.providers.Web3Provider(window.ethereum!);

    const contract = new ethers.Contract(address, abi, provider.getSigner());
    console.log('[Factory Contract]: ', contract);
    return contract;
  }
}

function parseArgs<R>(args: any[], keys: (keyof R)[]) {
  return args.reduce(
    (d, val, idx) => ({
      ...d,
      [keys[idx]]: val,
    }),
    {},
  );
}

export default class FFIController extends EventEmitter<ControllerEvents> {
  contract?: ethers.Contract;

  constructor(public address?: string) {
    super();

    this.contract = createContract(address);

    this._initEvents();
  }

  private _createDispatcher<E extends keyof ControllerEvents>(event: E, keys: SP<E>[]) {
    return (...args: any[]) => {
      this.emit(event, parseArgs(args, keys) as never);
    };
  }

  private _initEvents() {
    this.contract?.on(ContractEvents.onStaking, this._createDispatcher('onStaking', ['id', 'from', 'to', 'amount']));
    this.contract?.on(ContractEvents.onStartSeal, this._createDispatcher('onStartSeal', ['id', 'sender', 'time']));
    this.contract?.on(ContractEvents.onUnstaking, this._createDispatcher('onUnstaking', ['id', 'from', 'to', 'amount']));
    this.contract?.on(ContractEvents.onDestroyNode, this._createDispatcher('onDestroyNode', ['id', 'state']));
    this.contract?.on(ContractEvents.onRaiseFailed, this._createDispatcher('onRaiseFailed', ['id']));
    this.contract?.on(ContractEvents.onCloseRaisePlan, this._createDispatcher('onCloseRaisePlan', ['id', 'address', 'time']));
    this.contract?.on(ContractEvents.onDepositOpsFund, this._createDispatcher('onDepositOpsFund', ['id', 'sender', 'amount']));
    this.contract?.on(ContractEvents.onDepositRaiseFund, this._createDispatcher('onDepositRaiseFund', ['id', 'sender', 'amount']));
    this.contract?.on(ContractEvents.onServicerSigned, this._createDispatcher('onServicerSigned', ['sender', 'minerId', 'contract']));
    this.contract?.on(ContractEvents.onStartRaisePlan, this._createDispatcher('onStartRaisePlan', ['id', 'sender', 'time']));
    this.contract?.on(ContractEvents.onWithdrawOpsFund, this._createDispatcher('onWithdrawOpsFund', ['id', 'sender', 'amount']));
    this.contract?.on(ContractEvents.onWithdrawRaiseFund, this._createDispatcher('onWithdrawRaiseFund', ['id', 'sender', 'amount']));
    this.contract?.on(ContractEvents.onRaiserWithdraw, this._createDispatcher('onRaiserWithdraw', ['id', 'from', 'to', 'amount']));
    this.contract?.on(ContractEvents.onServicerWithdraw, this._createDispatcher('onServicerWithdraw', ['id', 'from', 'to', 'amount']));
    this.contract?.on(ContractEvents.onInvestorWithdraw, this._createDispatcher('onInvestorWithdraw', ['id', 'from', 'to', 'amount']));
    this.contract?.on(ContractEvents.onNodeStateChange, this._createDispatcher('onNodeStateChange', ['id', 'state']));
    this.contract?.on(ContractEvents.onRaiseStateChange, this._createDispatcher('onRaiseStateChange', ['id', 'state']));
  }

  async getNodeInfo(id: BigNumberish): Promise<NodeInfo | undefined> {
    return await this.contract?.nodeInfo(id);
  }

  async getRaiseInfo(id: BigNumberish): Promise<RaiseInfo | undefined> {
    return await this.contract?.raiseInfo(id);
  }

  async getNodeState(id: BigNumberish): Promise<NodeState | undefined> {
    return await this.contract?.nodeState(id);
  }

  async getRaiseState(id: BigNumberish): Promise<RaiseState | undefined> {
    return await this.contract?.raiseState(id);
  }

  /**
   * 缴纳运维保证金
   * @param id
   * @param opts
   */
  async depositOpsFund(id: BigNumberish, opts?: TxOptions) {
    await this.contract?.payOpsSecurityFund(id, {
      ...opts,
    });
  }

  /**
   * 缴纳发起人保证金
   * @param id
   * @param opts
   */
  async depositRaiseFund(id: BigNumberish, opts?: TxOptions) {
    await this.contract?.paySecurityFund(id, {
      ...opts,
    });
  }

  /**
   * 服务商签名
   * @param opts
   * @returns
   */
  async servicerSign(opts?: TxOptions) {
    await this.contract?.spSignWithMiner({
      ...opts,
    });
  }
}
