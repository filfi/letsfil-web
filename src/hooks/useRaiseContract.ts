import { ethers } from 'ethers';
import { useMount, useUnmount } from 'ahooks';
import MetaMaskOboarding from '@metamask/onboarding';
import type { BigNumberish } from 'ethers';

import { isRef } from '@/utils/utils';
import { withTx } from '@/helpers/app';
import abi from '@/abis/raise.abi.json';
import useAccounts from './useAccounts';
import { toastify } from '@/utils/hackify';
import { createDispatcher, EventType } from '@/utils/mitt';

export enum RaiseEventTypes {
  onStaking = 'Staking',
  onStartSeal = 'StartSeal',
  onUnstaking = 'Unstaking',
  onDestroyNode = 'DestroyNode',
  onRaiseFailed = 'RaiseFailed',
  onCloseRaisePlan = 'CloseRaisePlan',
  // onChangeOpsPayer = 'SpecifyOpsPayer',
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

let contract: ethers.Contract | undefined;

function getRefVal<T>(ref?: MaybeRef<T>) {
  if (ref && isRef(ref)) {
    return ref.current;
  }

  return ref;
}

function createContract(address?: string) {
  if (!address || !MetaMaskOboarding.isMetaMaskInstalled()) return;

  if (contract && contract.address === address) {
    return contract;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum!);

  contract = new ethers.Contract(address, abi, provider.getSigner());
  console.log('[Raise Contract]: ', contract);
  return contract;
}

const handlers = {
  // 质押
  onStaking: createDispatcher(EventType.onStaking, ['raiseID', 'from', 'to', 'amount']),
  // 启动封装
  onStartSeal: createDispatcher(EventType.onStaking, ['raiseID', 'sender', 'time']),
  // 解除质押
  onUnstaking: createDispatcher(EventType.onUnstaking, ['raiseID', 'from', 'to', 'amount']),
  // 节点结束
  onDestroyNode: createDispatcher(EventType.onDepositOpsFund, ['raiseID', 'state']),
  // 募集失败
  onRaiseFailed: createDispatcher(EventType.onRaiseFailed, ['raiseID']),
  // 修改保证金支付地址
  // onChangeOpsPayer: createDispatcher(EventType.onChangeOpsPayer, ['raiseID', 'sender', 'oldPayer', 'newPayer']),
  // 运维保证金缴纳
  onDepositRaiseFund: createDispatcher(EventType.onDepositRaiseFund, ['raiseID', 'sender', 'amount']),
  // 运维保证金缴纳
  onDepositOpsFund: createDispatcher(EventType.onDepositOpsFund, ['raiseID', 'sender', 'amount']),
  // 服务商已签名
  onServicerSigned: createDispatcher(EventType.onServicerSigned, ['raiseID', 'sender', 'minerId', 'oldOwner', 'contract']),
  // 募集计划启动
  onStartRaisePlan: createDispatcher(EventType.onStartRaisePlan, ['raiseID', 'sendar', 'time']),
  // 关闭募集计划
  onCloseRaisePlan: createDispatcher(EventType.onCloseRaisePlan, ['caller', 'raiseID']),
  // 募集商提取收益
  onRaiserWithdraw: createDispatcher(EventType.onRaiserWithdraw, ['raiseID', 'from', 'to', 'amount']),
  // 服务商提取收益
  onServicerWithdraw: createDispatcher(EventType.onServicerWithdraw, ['raiseID', 'from', 'to', 'amount']),
  // 投资人提取收益
  onInvestorWithdraw: createDispatcher(EventType.onInvestorWithdraw, ['raiseID', 'from', 'to', 'amount']),
  // 提取运维保证金
  onWithdrawOpsFund: createDispatcher(EventType.onWithdrawOpsFund, ['raiseID', 'sender', 'amount']),
  // 提取募集保证金
  onWithdrawRaiseFund: createDispatcher(EventType.onWithdrawRaiseFund, ['raiseID', 'sender', 'amount']),
  // 节点状态变更
  onNodeStateChange: createDispatcher(EventType.onNodeStateChange, ['raiseID', 'state']),
  // 募集计划状态变更
  onRaiseStateChange: createDispatcher(EventType.onRaiseStateChange, ['raiseID', 'state']),
};

export default function useRaiseContract(address?: MaybeRef<string | undefined>) {
  const { withConnect } = useAccounts();

  const bindEvents = () => {
    contract?.on(RaiseEventTypes.onStaking, handlers.onStaking);
    contract?.on(RaiseEventTypes.onUnstaking, handlers.onUnstaking);
    contract?.on(RaiseEventTypes.onDestroyNode, handlers.onDestroyNode);
    contract?.on(RaiseEventTypes.onRaiseFailed, handlers.onRaiseFailed);
    // contract?.on(RaiseEventTypes.onChangeOpsPayer, handlers.onChangeOpsPayer);
    contract?.on(RaiseEventTypes.onCloseRaisePlan, handlers.onCloseRaisePlan);
    contract?.on(RaiseEventTypes.onDepositOpsFund, handlers.onDepositOpsFund);
    contract?.on(RaiseEventTypes.onDepositRaiseFund, handlers.onDepositRaiseFund);
    contract?.on(RaiseEventTypes.onServicerSigned, handlers.onServicerSigned);
    contract?.on(RaiseEventTypes.onStartRaisePlan, handlers.onStartRaisePlan);
    contract?.on(RaiseEventTypes.onWithdrawOpsFund, handlers.onWithdrawOpsFund);
    contract?.on(RaiseEventTypes.onWithdrawRaiseFund, handlers.onWithdrawRaiseFund);
    contract?.on(RaiseEventTypes.onRaiserWithdraw, handlers.onRaiserWithdraw);
    contract?.on(RaiseEventTypes.onServicerWithdraw, handlers.onServicerWithdraw);
    contract?.on(RaiseEventTypes.onInvestorWithdraw, handlers.onInvestorWithdraw);
    contract?.on(RaiseEventTypes.onNodeStateChange, handlers.onNodeStateChange);
    contract?.on(RaiseEventTypes.onRaiseStateChange, handlers.onRaiseStateChange);
  };

  const unbindEvent = () => {
    contract?.off(RaiseEventTypes.onStaking, handlers.onStaking);
    contract?.off(RaiseEventTypes.onUnstaking, handlers.onUnstaking);
    contract?.off(RaiseEventTypes.onDestroyNode, handlers.onDestroyNode);
    contract?.off(RaiseEventTypes.onRaiseFailed, handlers.onRaiseFailed);
    // contract?.off(RaiseEventTypes.onChangeOpsPayer, handlers.onChangeOpsPayer);
    contract?.off(RaiseEventTypes.onCloseRaisePlan, handlers.onCloseRaisePlan);
    contract?.off(RaiseEventTypes.onDepositOpsFund, handlers.onDepositOpsFund);
    contract?.off(RaiseEventTypes.onDepositRaiseFund, handlers.onDepositRaiseFund);
    contract?.off(RaiseEventTypes.onServicerSigned, handlers.onServicerSigned);
    contract?.off(RaiseEventTypes.onStartRaisePlan, handlers.onStartRaisePlan);
    contract?.off(RaiseEventTypes.onWithdrawOpsFund, handlers.onWithdrawOpsFund);
    contract?.off(RaiseEventTypes.onWithdrawRaiseFund, handlers.onWithdrawRaiseFund);
    contract?.off(RaiseEventTypes.onRaiserWithdraw, handlers.onRaiserWithdraw);
    contract?.off(RaiseEventTypes.onServicerWithdraw, handlers.onServicerWithdraw);
    contract?.off(RaiseEventTypes.onInvestorWithdraw, handlers.onInvestorWithdraw);
    contract?.off(RaiseEventTypes.onNodeStateChange, handlers.onNodeStateChange);
    contract?.off(RaiseEventTypes.onRaiseStateChange, handlers.onInvestorWithdraw);
  };

  const initContract = () => {
    if (!contract) {
      createContract(getRefVal(address));
      bindEvents();
    }
  };

  useMount(initContract);

  useUnmount(unbindEvent);

  const withContract = <R = any, P extends unknown[] = any>(service: (contract: ethers.Contract | undefined, ...args: P) => Promise<R>) => {
    return async (...args: P) => {
      initContract();

      return await service(contract, ...args);
    };
  };

  const getContract = (address?: string) => {
    if (address) {
      return createContract(address);
    }

    return contract;
  };

  /**
   * 获取募集计划信息
   */
  const getRaiseInfo = withConnect(
    withContract(async (contract, id: BigNumberish) => {
      return await contract?.raiseInfo(id);
    }),
  );

  /**
   * 获取节点信息
   */
  const getNodeInfo = withConnect(
    withContract(async (contract, id: BigNumberish) => {
      return await contract?.nodeInfo(id);
    }),
  );

  /**
   * 获取募集计划状态
   */
  const getRaiseState = withConnect(
    withContract(async (contract, id: BigNumberish) => {
      return await contract?.raiseState(id);
    }),
  );

  /**
   * 获取节点状态
   */
  const getNodeState = withConnect(
    withContract(async (contract, id: BigNumberish) => {
      return await contract?.nodeState(id);
    }),
  );

  /**
   * 缴纳募集保证金
   */
  const depositRaiseFund = toastify(
    withConnect(
      withTx(
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract?.paySecurityFund(id, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 缴纳运维保证金
   */
  const depositOpsFund = toastify(
    withConnect(
      withTx(
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract?.payOpsSecurityFund(id, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 服务商签名
   */
  const servicerSign = toastify(
    withConnect(
      withTx(
        withContract(async (contract, opts?: TxOptions) => {
          return await contract?.spSignWithMiner({
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 指定保证金缴纳地址
   */
  // const changeOpsPayer = toastify(
  //   withConnect(
  //     withTx(
  //       withContract(async (contract, address: string, opts?: TxOptions) => {
  //         return await contract?.specifyOpsPayer(address, {
  //           ...opts,
  //         });
  //       }),
  //     ),
  //   ),
  // );

  /**
   * 启动封装
   */
  const startSeal = toastify(
    withConnect(
      withTx(
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract?.startSeal(id, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 启动募集计划
   */
  const startRaisePlan = toastify(
    withConnect(
      withTx(
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract?.startRaisePlan(id, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 关闭募集计划
   */
  const closeRaisePlan = toastify(
    withConnect(
      withTx(
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract?.closeRaisePlan(id, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 质押
   */
  const staking = toastify(
    withConnect(
      withTx(
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract?.staking(id, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 解除质押|赎回
   */
  const unStaking = toastify(
    withConnect(
      withTx(
        withContract(async (contract, amount: ethers.BigNumber, opts?: TxOptions) => {
          return await contract?.unStaking(amount, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 提取募集保证金
   */
  const withdrawRaiseFund = toastify(
    withConnect(
      withTx(
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract?.WithdrawSecurityFund(id, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 提取运维保证金
   */
  const withdrawOpsFund = toastify(
    withConnect(
      withTx(
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract?.WithdrawOpsSecurityFund(id, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 募集商提取收益
   */
  const raiserWithdraw = toastify(
    withConnect(
      withTx(
        withContract(async (contract, amount: ethers.BigNumber, opts?: TxOptions) => {
          return await contract?.raiserWithdraw(amount, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 服务商提取收益
   */
  const servicerWithdraw = toastify(
    withConnect(
      withTx(
        withContract(async (contract, amount: ethers.BigNumber, opts?: TxOptions) => {
          return await contract?.spWithdraw(amount, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 投资人提取收益
   */
  const investorWithdraw = toastify(
    withConnect(
      withTx(
        withContract(async (contract, to: string, amount: ethers.BigNumber, opts?: TxOptions) => {
          return await contract?.investorWithdraw(to, amount, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 获取质押总额
   */
  const pledgeTotalAmount = withConnect(
    withContract(async (contract, id: BigNumberish) => {
      return await contract?.pledgeTotalAmount(id);
    }),
  );

  /**
   * 获取质押金额
   */
  const pledgeAmount = withConnect(
    withContract(async (/* contract, id: BigNumberish, address: string */) => {
      // return await contract?.pledgeRecord(address);
      return 0;
    }),
  );

  /**
   * 获取质押累计金额
   */
  const pledgeRecord = withConnect(
    withContract(async (/* contract, id: BigNumberish, address: string */) => {
      // return await contract?.pledgeRecordCalc(address);
      return 0;
    }),
  );

  /**
   * 获取募集保证金
   */
  const getRaiseFund = withConnect(
    withContract(async (contract, id: BigNumberish) => {
      return await contract?.securityFundRemain(id);
    }),
  );

  /**
   * 获取运维保证金
   */
  const getOpsFund = withConnect(
    withContract(async (contract, id: BigNumberish) => {
      return await contract?.opsSecurityFundRemain(id);
    }),
  );

  /**
   * 获取募集商已领取的收益
   */
  const getRaiserWithdrawnReward = withConnect(
    withContract(async (contract, id: BigNumberish) => {
      return await contract?.gotRaiserReward(id);
    }),
  );

  /**
   * 获取募集商可领取的收益
   */
  const getRaiserAvailableReward = withConnect(
    withContract(async (contract, id: BigNumberish) => {
      return await contract?.raiserRewardAvailableLeft(id);
    }),
  );

  /**
   * 获取募集商待释放的收益
   */
  const getRaiserPendingReward = withConnect(
    withContract(async (contract, id: BigNumberish) => {
      return await contract?.raiserWillReleaseReward(id);
    }),
  );

  /**
   * 获取服务商已领取的收益
   */
  const getServicerWithdrawnReward = withConnect(
    withContract(async (contract, id: BigNumberish) => {
      return await contract?.gotSpReward(id);
    }),
  );

  /**
   * 获取服务商可领取的收益
   */
  const getServicerAvailableReward = withConnect(
    withContract(async (contract, id: BigNumberish) => {
      return await contract?.spRewardAvailableLeft(id);
    }),
  );

  /**
   * 获取服务商待释放的收益
   */
  const getServicerPendingReward = withConnect(
    withContract(async (contract, id: BigNumberish) => {
      return await contract?.spWillReleaseReward(id);
    }),
  );

  /**
   * 获取服务商可领取的收益
   */
  const totalRewardAmount = withConnect(
    withContract(async (contract, id: BigNumberish) => {
      return await contract?.totalRewardAmount(id);
    }),
  );

  /**
   * 获取服务商待释放的收益
   */
  const totalReleasedRewardAmount = withConnect(
    withContract(async (contract, id: BigNumberish) => {
      return await contract?.totalReleasedRewardAmount(id);
    }),
  );

  /**
   * 获取投资人总收益
   */
  const totalRewardOf = withConnect(
    withContract(async (contract, id: BigNumberish, address: string) => {
      return await contract?.totalRewardOf(id, address);
    }),
  );

  /**
   * 获取投资人可提取收益
   */
  const availableRewardOf = withConnect(
    withContract(async (contract, id: BigNumberish, address: string) => {
      return await contract?.availableRewardOf(id, address);
    }),
  );

  /**
   * 获取投资人待释放收益
   */
  const pendingRewardOf = withConnect(
    withContract(async (contract, id: BigNumberish, address: string) => {
      return await contract?.willReleaseOf(id, address);
    }),
  );

  /**
   * 获取投资人提取记录
   */
  const withdrawRecord = withConnect(
    withContract(async (contract, id: BigNumberish, address: string) => {
      return await contract?.withdrawRecord(id, address);
    }),
  );

  return {
    staking,
    unStaking,
    getContract,
    getOpsFund,
    getRaiseFund,
    closeRaisePlan,
    depositOpsFund,
    depositRaiseFund,
    servicerSign,
    getNodeInfo,
    getRaiseInfo,
    getNodeState,
    getRaiseState,
    // changeOpsPayer,
    startSeal,
    startRaisePlan,
    withdrawOpsFund,
    withdrawRaiseFund,
    raiserWithdraw,
    servicerWithdraw,
    investorWithdraw,
    pledgeAmount,
    pledgeRecord,
    pledgeTotalAmount,
    getRaiserAvailableReward,
    getRaiserPendingReward,
    getRaiserWithdrawnReward,
    getServicerAvailableReward,
    getServicerPendingReward,
    getServicerWithdrawnReward,
    totalRewardAmount,
    totalReleasedRewardAmount,
    totalRewardOf,
    availableRewardOf,
    pendingRewardOf,
    withdrawRecord,
  };
}
