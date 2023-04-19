import mitt from 'mitt';
import { ethers } from 'ethers';

export enum EventType {
  onStaking = 'onStaking', // 质押
  onUnstaking = 'onUnstaking', // 解除质押
  onRaiseFailed = 'onRaiseFailed', // 质押失败
  onChangeOpsPayer = 'onChangeOpsPayer', // 修改保证金支付地址
  onDepositOPSFund = 'onDepositOPSFund', // 运维保证金支付
  onStartRaisePlan = 'onStartRaisePlan', // 募集计划启动
  onCloseRaisePlan = 'onCloseRaisePlan', // 募集计划关闭
  onCreateRaisePlan = 'onCreateRaisePlan', // 募集计划创建
  onWithdrawOPSFund = 'onWithdrawOPSFund', // 提取运维保证金
  onWithdrawRaiseFund = 'onWithdrawRaiseFund', // 提取募集保证金
  onRaiserWithdraw = 'onRaiserWithdraw', // 募集商提取收益
  onServicerWithdraw = 'onServicerWithdraw', // 服务商提取收益
  onInvestorWithdraw = 'onInvestorWithdraw', // 投资者提取收益
}

export type Data = {
  raiseID: ethers.BigNumber;
};

export type Events<D extends Data = Data> = {
  [EventType.onStaking]: D;
  [EventType.onUnstaking]: D;
  [EventType.onRaiseFailed]: D;
  [EventType.onChangeOpsPayer]: D;
  [EventType.onCreateRaisePlan]: D;
  [EventType.onDepositOPSFund]: D;
  [EventType.onStartRaisePlan]: D;
  [EventType.onCloseRaisePlan]: D;
  [EventType.onWithdrawOPSFund]: D;
  [EventType.onWithdrawRaiseFund]: D;
  [EventType.onRaiserWithdraw]: D;
  [EventType.onServicerWithdraw]: D;
  [EventType.onInvestorWithdraw]: D;
};

const emitter = mitt<Events>();

export function createDispatcher<D extends Data = Data>(event: keyof Events<D>, keys?: string[]) {
  return (...args: any[]) => {
    const data = keys?.reduce((d, key, i) => {
      return {
        ...d,
        [key]: args[i],
      };
    }, {});

    emitter.emit(event, data ?? ({} as any));
  };
}

export default emitter;
