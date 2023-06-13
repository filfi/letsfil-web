import mitt from 'mitt';
import { ethers } from 'ethers';
import { debounce } from 'lodash';

export enum EventType {
  onStaking = 'onStaking', // 质押
  onStartSeal = 'StartSeal', // 启动封装
  onUnstaking = 'onUnstaking', // 解除质押
  onDestroyNode = 'onDestroyNode', // 节点运行结束
  onRaiseFailed = 'onRaiseFailed', // 质押失败
  onStartPreSeal = 'StartPreSeal', // 启动预封装
  onDepositOpsFund = 'onDepositOpsFund', // 运维保证金支付
  onDepositRaiseFund = 'onDepositRaiseFund', // 主办人保证金支付
  onServicerSigned = 'onServicerSigned', // 服务商已签名
  onStartRaisePlan = 'onStartRaisePlan', // 节点计划启动
  onCloseRaisePlan = 'onCloseRaisePlan', // 节点计划关闭
  onCreateRaisePlan = 'onCreateRaisePlan', // 节点计划创建
  onWithdrawOpsFund = 'onWithdrawOpsFund', // 提取运维保证金
  onWithdrawRaiseFund = 'onWithdrawRaiseFund', // 提取主办人保证金
  onRaiserWithdraw = 'onRaiserWithdraw', // 主办人提取节点激励
  onServicerWithdraw = 'onServicerWithdraw', // 服务商提取节点激励
  onInvestorWithdraw = 'onInvestorWithdraw', // 建设者提取节点激励
  onNodeStateChange = 'onNodeStateChange', // 节点状态改变
  onRaiseStateChange = 'onRaiseStateChange', // 节点计划状态改变
}

export type Data = {
  raiseID: ethers.BigNumber;
};

export type Events<D extends Data = Data> = {
  [EventType.onStaking]: D;
  [EventType.onStartSeal]: D;
  [EventType.onUnstaking]: D;
  [EventType.onDestroyNode]: D;
  [EventType.onRaiseFailed]: D;
  [EventType.onStartPreSeal]: D;
  [EventType.onCreateRaisePlan]: D;
  [EventType.onDepositOpsFund]: D;
  [EventType.onDepositRaiseFund]: D;
  [EventType.onServicerSigned]: D;
  [EventType.onStartRaisePlan]: D;
  [EventType.onCloseRaisePlan]: D;
  [EventType.onWithdrawOpsFund]: D;
  [EventType.onWithdrawRaiseFund]: D;
  [EventType.onRaiserWithdraw]: D;
  [EventType.onServicerWithdraw]: D;
  [EventType.onInvestorWithdraw]: D;
  [EventType.onNodeStateChange]: D;
  [EventType.onRaiseStateChange]: D;
};

const emitter = mitt<Events>();

export function createDispatcher<D extends Data = Data>(event: keyof Events<D>, keys?: string[]) {
  return debounce((...args: any[]) => {
    const data = keys?.reduce((d, key, i) => {
      return {
        ...d,
        [key]: args[i],
      };
    }, {});

    emitter.emit(event, data ?? ({} as any));
  }, 200);
}

export default emitter;
