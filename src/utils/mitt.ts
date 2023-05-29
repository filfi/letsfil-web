import mitt from 'mitt';
import { ethers } from 'ethers';
import { debounce } from 'lodash';

export enum EventType {
  onStaking = 'onStaking', // 质押
  onStartSeal = 'StartSeal', // 启动封装
  onUnstaking = 'onUnstaking', // 解除质押
  onDestroyNode = 'onDestroyNode', // 节点运行结束
  onRaiseFailed = 'onRaiseFailed', // 质押失败
  onChangeOpsPayer = 'onChangeOpsPayer', // 修改保证金支付地址
  onDepositOpsFund = 'onDepositOpsFund', // 运维保证金支付
  onDepositRaiseFund = 'onDepositRaiseFund', // 募集保证金支付
  onServicerSigned = 'onServicerSigned', // 服务商已签名
  onStartRaisePlan = 'onStartRaisePlan', // 募集计划启动
  onCloseRaisePlan = 'onCloseRaisePlan', // 募集计划关闭
  onCreateRaisePlan = 'onCreateRaisePlan', // 募集计划创建
  onWithdrawOpsFund = 'onWithdrawOpsFund', // 提取运维保证金
  onWithdrawRaiseFund = 'onWithdrawRaiseFund', // 提取募集保证金
  onRaiserWithdraw = 'onRaiserWithdraw', // 募集商提取收益
  onServicerWithdraw = 'onServicerWithdraw', // 服务商提取收益
  onInvestorWithdraw = 'onInvestorWithdraw', // 投资者提取收益
  onNodeStateChange = 'onNodeStateChange', // 节点状态改变
  onRaiseStateChange = 'onRaiseStateChange', // 募集计划状态改变
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
  [EventType.onChangeOpsPayer]: D;
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
