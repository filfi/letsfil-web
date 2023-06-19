import { usePublicClient } from 'wagmi';

import abi from '@/abis/raise.abi.json';
import fabi from '@/abis/factory.abi.json';
import { RAISE_ADDRESS } from '@/constants';
import { WatchContractEventParameters } from 'viem';

type OnLogsFn = Required<WatchContractEventParameters>['onLogs'];
type EventName = Required<WatchContractEventParameters>['eventName'];

export default function useContractEvent(address?: API.Address) {
  const { watchContractEvent } = usePublicClient();

  const watchEvent = function <P extends unknown[] = any>(eventName: EventName, handler: OnLogsFn, args?: P) {
    return watchContractEvent({
      abi,
      args,
      address,
      eventName,
      onLogs: handler,
    });
  };

  const withProxyHandler = (handler: OnLogsFn): OnLogsFn => {
    return (...args) => {
      console.log(args);

      handler(...args);
    };
  };

  /**
   * 节点计划创建（主办人签名）
   */
  const onCreateRaisePlan = (id: string, handler: OnLogsFn) => {
    return watchContractEvent({
      abi: fabi,
      args: [id],
      address: RAISE_ADDRESS,
      eventName: 'CreateRaisePlan',
      onLogs: withProxyHandler(handler),
    });
  };

  /**
   * 节点状态改变
   */
  const onNodeStateChange = (id: string, handler: OnLogsFn) => {
    return watchEvent('NodeStateChange', withProxyHandler(handler), [id]);
  };

  /**
   * 节点计划状态改变
   */
  const onRaiseStateChange = (id: string, handler: OnLogsFn) => {
    return watchEvent('RaiseStateChange', withProxyHandler(handler), [id]);
  };

  /**
   * 建设者质押
   */
  const onStaking = (id: string, handler: OnLogsFn) => {
    return watchEvent('Staking', withProxyHandler(handler), [id]);
  };

  /**
   * 建设者解除质押
   */
  const onUnstaking = (id: string, handler: OnLogsFn) => {
    return watchEvent('Unstaking', withProxyHandler(handler), [id]);
  };

  /**
   * 封装结束
   */
  const onSealEnd = (id: string, handler: OnLogsFn) => {
    return watchEvent('SealEnd', withProxyHandler(handler), [id]);
  };

  /**
   * 启动封装
   */
  const onStartSeal = (id: string, handler: OnLogsFn) => {
    return watchEvent('StartSeal', withProxyHandler(handler), [id]);
  };

  /**
   * 启动预封装
   */
  const onStartPreSeal = (id: string, handler: OnLogsFn) => {
    return watchEvent('StartPreSeal', withProxyHandler(handler), [id]);
  };

  /**
   * 质押失败
   */
  const onRaiseFailed = (id: string, handler: OnLogsFn) => {
    return watchEvent('RaiseFailed', withProxyHandler(handler), [id]);
  };

  /**
   * 质押成功
   */
  const onRaiseSuccess = (id: string, handler: OnLogsFn) => {
    return watchEvent('RaiseSuccess', withProxyHandler(handler), [id]);
  };

  /**
   * 关闭节点计划
   */
  const onCloseRaisePlan = (id: string, handler: OnLogsFn) => {
    return watchEvent('CloseRaisePlan', withProxyHandler(handler), [id]);
  };

  /**
   * 启动节点计划
   */
  const onStartRaisePlan = (id: string, handler: OnLogsFn) => {
    return watchEvent('StartRaisePlan', withProxyHandler(handler), [id]);
  };

  /**
   * 存入运维保证金
   */
  const onDepositOpsRund = (id: string, handler: OnLogsFn) => {
    return watchEvent('DepositOpsSecurityFund', withProxyHandler(handler), [id]);
  };

  /**
   * 存入主办人保证金
   */
  const onDepositRaiserRund = (id: string, handler: OnLogsFn) => {
    return watchEvent('DepositSecurityFund', withProxyHandler(handler), [id]);
  };

  /**
   * 技术服务商签名
   */
  const onServicerSigned = (address: API.Address, handler: OnLogsFn) => {
    return watchEvent('SpSignWithMiner', withProxyHandler(handler), [address]);
  };

  /**
   * 取回运维保证金
   */
  const onWithdrawOpsFund = (address: API.Address, handler: OnLogsFn) => {
    return watchEvent('WithdrawOpsSecurityFund', withProxyHandler(handler), [address]);
  };

  /**
   * 提取主办人保证金
   */
  const onWithdrawRaiserFund = (address: API.Address, handler: OnLogsFn) => {
    return watchEvent('WithdrawSecurityFund', withProxyHandler(handler), [address]);
  };

  /**
   * 主办人提取节点激励
   */
  const onRaiserWithdraw = (id: string, handler: OnLogsFn) => {
    return watchEvent('RaiserWithdraw', withProxyHandler(handler), [id]);
  };

  /**
   * 建设者提取节点激励
   */
  const onInvestorWithdraw = (id: string, handler: OnLogsFn) => {
    return watchEvent('InvestorWithdraw', withProxyHandler(handler), [id]);
  };

  /**
   * 服务商提取节点激励
   */
  const onServicerWithdraw = (id: string, handler: OnLogsFn) => {
    return watchEvent('SpWithdraw', withProxyHandler(handler), [id]);
  };

  return {
    onStaking,
    onUnstaking,
    onSealEnd,
    onStartSeal,
    onStartPreSeal,
    onRaiseFailed,
    onRaiseSuccess,
    onNodeStateChange,
    onRaiseStateChange,
    onCreateRaisePlan,
    onCloseRaisePlan,
    onStartRaisePlan,
    onDepositOpsRund,
    onDepositRaiserRund,
    onServicerSigned,
    onWithdrawOpsFund,
    onWithdrawRaiserFund,
    onRaiserWithdraw,
    onInvestorWithdraw,
    onServicerWithdraw,
  };
}
