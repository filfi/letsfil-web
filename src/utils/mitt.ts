import mitt from 'mitt';

export enum EventType {
  OnStaking = 'onStaking', // 质押
  OnUnstaking = 'onUnstaking', // 解除质押
  OnRaiseFailed = 'eRaiseFailed', // 质押失败
  OnCreateRaise = 'onCreateRaise', // 募集计划创建
  OnDepositOPSFund = 'onDepositOPSFund', // 运维保证金支付
  OnStartRaisePlan = 'onStartRaisePlan', // 募集计划启动
  OnCloseRaisePlan = 'onCloseRaisePlan', // 募集计划关闭
  OnWithdrawOPSFund = 'onWithdrawOPSFund', // 提取运维保证金
  OnWithdrawRaiseFund = 'onWithdrawRaiseFund', // 提取募集保证金
}

export type Events = {
  [EventType.OnStaking]: object;
  [EventType.OnUnstaking]: object;
  [EventType.OnRaiseFailed]: object;
  [EventType.OnCreateRaise]: object;
  [EventType.OnDepositOPSFund]: object;
  [EventType.OnStartRaisePlan]: object;
  [EventType.OnCloseRaisePlan]: object;
  [EventType.OnWithdrawOPSFund]: object;
  [EventType.OnWithdrawRaiseFund]: object;
};

const emitter = mitt<Events>();

export function createDispatcher(event: keyof Events, keys?: string[]) {
  return (...args: any[]) => {
    const data = keys?.reduce((d, key, i) => {
      return {
        ...d,
        [key]: args[i],
      };
    }, {});

    emitter.emit(event, data ?? {});
  };
}

export default emitter;
