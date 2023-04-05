import { useRef } from 'react';
import { BigNumber, ethers } from 'ethers';
import { useMount, useUnmount } from 'ahooks';
import MetaMaskOboarding from '@metamask/onboarding';

import abi from '@/abis/plan.abi.json';
import { createDispatcher, EventType } from '@/utils/mitt';

export enum PlanEventTypes {
  onStaking = 'eStaking',
  onUnstaking = 'eUnstaking',
  onRaiseFailed = 'eRaiseFailed',
  onCloseRaisePlan = 'eCloseRaisePlan',
  onStartRaisePlan = 'eStartRaisePlan',
  onDepositOPSFund = 'eDepositOPSSecurityFund',
  onWithdrawOPSFund = 'eWithdrawOPSSecurityFund',
  onWithdrawRaiseFund = 'eWithdrawRaiseSecurityFund',
}

function cretateContract(address?: string) {
  if (MetaMaskOboarding.isMetaMaskInstalled() && address) {
    const provider = new ethers.providers.Web3Provider(window.ethereum!);

    const signer = provider.getSigner();

    return new ethers.Contract(address, abi.abi, signer);
  }
}

const events = {
  // 质押
  onStaking: createDispatcher(EventType.OnStaking, [
    'raiseID',
    'from',
    'to',
    'amount',
  ]),
  // 解除质押
  onUnstaking: createDispatcher(EventType.OnUnstaking, [
    'raiseID',
    'from',
    'to',
    'amount',
  ]),
  // 解除质押
  onRaiseFailed: createDispatcher(EventType.OnRaiseFailed, ['raiseID']),
  // 运维保证金缴纳
  onDepositOPSFund: createDispatcher(EventType.OnDepositOPSFund, [
    'raiseID',
    'sender',
    'amount',
  ]),
  // 募集计划启动
  onStartRaisePlan: createDispatcher(EventType.OnStartRaisePlan, [
    'caller',
    'raiseID',
  ]),
  // 关闭募集计划
  onCloseRaisePlan: createDispatcher(EventType.OnCloseRaisePlan, [
    'caller',
    'raiseID',
  ]),
  // 提取运维保证金
  onWithdrawOPSFund: createDispatcher(EventType.OnWithdrawOPSFund, [
    'caller',
    'raiseID',
    'amount',
  ]),
  // 提取运维保证金
  onWithdrawRaiseFund: createDispatcher(EventType.OnWithdrawRaiseFund, [
    'caller',
    'raiseID',
    'amount',
  ]),
};

export default function usePlanContract(
  address: React.MutableRefObject<string | undefined>,
) {
  const contract = useRef(cretateContract(address.current));

  const bindEvents = () => {
    contract.current?.on(PlanEventTypes.onStaking, events.onStaking);
    contract.current?.on(PlanEventTypes.onUnstaking, events.onUnstaking);
    contract.current?.on(PlanEventTypes.onRaiseFailed, events.onRaiseFailed);
    contract.current?.on(
      PlanEventTypes.onCloseRaisePlan,
      events.onCloseRaisePlan,
    );
    contract.current?.on(
      PlanEventTypes.onDepositOPSFund,
      events.onDepositOPSFund,
    );
    contract.current?.on(
      PlanEventTypes.onStartRaisePlan,
      events.onStartRaisePlan,
    );
    contract.current?.on(
      PlanEventTypes.onWithdrawOPSFund,
      events.onWithdrawOPSFund,
    );
    contract.current?.on(
      PlanEventTypes.onWithdrawRaiseFund,
      events.onWithdrawRaiseFund,
    );
  };

  useMount(bindEvents);

  useUnmount(() => {
    contract.current?.off(PlanEventTypes.onStaking, events.onStaking);
    contract.current?.off(PlanEventTypes.onUnstaking, events.onUnstaking);
    contract.current?.off(PlanEventTypes.onRaiseFailed, events.onRaiseFailed);
    contract.current?.off(
      PlanEventTypes.onCloseRaisePlan,
      events.onCloseRaisePlan,
    );
    contract.current?.off(
      PlanEventTypes.onDepositOPSFund,
      events.onDepositOPSFund,
    );
    contract.current?.off(
      PlanEventTypes.onStartRaisePlan,
      events.onStartRaisePlan,
    );
    contract.current?.off(
      PlanEventTypes.onWithdrawOPSFund,
      events.onWithdrawOPSFund,
    );
    contract.current?.off(
      PlanEventTypes.onWithdrawRaiseFund,
      events.onWithdrawRaiseFund,
    );
  });

  const withContract = <R = any, P extends unknown[] = any>(
    handler: (...args: P) => Promise<R>,
  ) => {
    return async (...args: P) => {
      if (!contract.current) {
        contract.current = cretateContract(address.current);

        bindEvents();
      }

      return handler(...args);
    };
  };

  /**
   * 获取募集计划状态
   */
  const getRaiseState = withContract(async () => {
    console.log(contract.current);
    return await contract.current?.raiseState();
  });

  /**
   * 缴纳运维保证金
   */
  const depositOPSFund = withContract(async (opts?: { value?: BigNumber }) => {
    console.log(contract.current);
    return await contract.current?.payOpsSecurityFund({
      ...opts,
    });
  });

  /**
   * 指定保证金缴纳地址
   */
  const specifyOpsPayer = withContract(async (address: string) => {
    return await contract.current?.specifyOpsPayer(address);
  });

  /**
   * 启动募集计划
   */
  const startRaisePlan = withContract(async () => {
    return await contract.current?.startRaisePlan({
      gasLimit: 10000000000,
    });
  });

  /**
   * 关闭募集计划
   */
  const closeRaisePlan = withContract(async () => {
    return await contract.current?.closeRaisePlan({
      gasLimit: 10000000000,
    });
  });

  /**
   * 已募集金额
   */
  const pledgeTotalAmount = withContract(async () => {
    return await contract.current?.pledgeTotalAmount();
  });

  /**
   * 募集金额
   */
  const pledgeAmount = withContract(async (address: string) => {
    return await contract.current?.pledgeRecord(address);
  });

  /**
   * 提取募集保证金
   */
  const withdrawRaiseFund = withContract(async () => {
    return await contract.current?.withdrawRaiseSecurityFund();
  });

  /**
   * 提取运维保证金
   */
  const withdrawOPSFund = withContract(async () => {
    return await contract.current?.withdrawOPSSecurityFund();
  });

  return {
    closeRaisePlan,
    depositOPSFund,
    getRaiseState,
    specifyOpsPayer,
    startRaisePlan,
    withdrawOPSFund,
    withdrawRaiseFund,
    pledgeAmount,
    pledgeTotalAmount,
  };
}
