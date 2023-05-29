import { ethers } from 'ethers';
import { useMount, useUnmount } from 'ahooks';
import { useEffect, useMemo, useRef } from 'react';
import type { BigNumberish } from 'ethers';

import { isRef } from '@/utils/utils';
import useAccounts from './useAccounts';
import { toastify } from '@/utils/hackify';
import { createContract, withTx } from '@/helpers/app';
import { createDispatcher, EventType } from '@/utils/mitt';

export enum RaiseEventTypes {
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

function getRefVal<T>(ref?: MaybeRef<T>) {
  if (ref && isRef(ref)) {
    return ref.current;
  }

  return ref;
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
  const rawAddr = useMemo(() => getRefVal(address), [address]);

  const contract = useRef(createContract(rawAddr));

  const bindEvents = () => {
    contract.current?.on(RaiseEventTypes.onStaking, handlers.onStaking);
    contract.current?.on(RaiseEventTypes.onStartSeal, handlers.onStartSeal);
    contract.current?.on(RaiseEventTypes.onUnstaking, handlers.onUnstaking);
    contract.current?.on(RaiseEventTypes.onDestroyNode, handlers.onDestroyNode);
    contract.current?.on(RaiseEventTypes.onRaiseFailed, handlers.onRaiseFailed);
    // contract.current?.on(RaiseEventTypes.onChangeOpsPayer, handlers.onChangeOpsPayer);
    contract.current?.on(RaiseEventTypes.onCloseRaisePlan, handlers.onCloseRaisePlan);
    contract.current?.on(RaiseEventTypes.onDepositOpsFund, handlers.onDepositOpsFund);
    contract.current?.on(RaiseEventTypes.onDepositRaiseFund, handlers.onDepositRaiseFund);
    contract.current?.on(RaiseEventTypes.onServicerSigned, handlers.onServicerSigned);
    contract.current?.on(RaiseEventTypes.onStartRaisePlan, handlers.onStartRaisePlan);
    contract.current?.on(RaiseEventTypes.onWithdrawOpsFund, handlers.onWithdrawOpsFund);
    contract.current?.on(RaiseEventTypes.onWithdrawRaiseFund, handlers.onWithdrawRaiseFund);
    contract.current?.on(RaiseEventTypes.onRaiserWithdraw, handlers.onRaiserWithdraw);
    contract.current?.on(RaiseEventTypes.onServicerWithdraw, handlers.onServicerWithdraw);
    contract.current?.on(RaiseEventTypes.onInvestorWithdraw, handlers.onInvestorWithdraw);
    contract.current?.on(RaiseEventTypes.onNodeStateChange, handlers.onNodeStateChange);
    contract.current?.on(RaiseEventTypes.onRaiseStateChange, handlers.onRaiseStateChange);
  };

  const unbindEvent = () => {
    contract.current?.off(RaiseEventTypes.onStaking, handlers.onStaking);
    contract.current?.off(RaiseEventTypes.onStartSeal, handlers.onStartSeal);
    contract.current?.off(RaiseEventTypes.onUnstaking, handlers.onUnstaking);
    contract.current?.off(RaiseEventTypes.onDestroyNode, handlers.onDestroyNode);
    contract.current?.off(RaiseEventTypes.onRaiseFailed, handlers.onRaiseFailed);
    contract.current?.off(RaiseEventTypes.onCloseRaisePlan, handlers.onCloseRaisePlan);
    contract.current?.off(RaiseEventTypes.onDepositOpsFund, handlers.onDepositOpsFund);
    contract.current?.off(RaiseEventTypes.onDepositRaiseFund, handlers.onDepositRaiseFund);
    contract.current?.off(RaiseEventTypes.onServicerSigned, handlers.onServicerSigned);
    contract.current?.off(RaiseEventTypes.onStartRaisePlan, handlers.onStartRaisePlan);
    contract.current?.off(RaiseEventTypes.onWithdrawOpsFund, handlers.onWithdrawOpsFund);
    contract.current?.off(RaiseEventTypes.onWithdrawRaiseFund, handlers.onWithdrawRaiseFund);
    contract.current?.off(RaiseEventTypes.onRaiserWithdraw, handlers.onRaiserWithdraw);
    contract.current?.off(RaiseEventTypes.onServicerWithdraw, handlers.onServicerWithdraw);
    contract.current?.off(RaiseEventTypes.onInvestorWithdraw, handlers.onInvestorWithdraw);
    contract.current?.off(RaiseEventTypes.onNodeStateChange, handlers.onNodeStateChange);
    contract.current?.off(RaiseEventTypes.onRaiseStateChange, handlers.onInvestorWithdraw);
  };

  const initContract = () => {
    if (!contract.current) {
      contract.current = createContract(rawAddr);
    }

    bindEvents();
  };

  useEffect(initContract, [rawAddr]);

  useMount(initContract);

  useUnmount(unbindEvent);

  const withContract = <R = any, P extends unknown[] = any>(service: (contract: ethers.Contract | undefined, ...args: P) => Promise<R>) => {
    return async (...args: P) => {
      initContract();

      return await service(contract.current, ...args);
    };
  };

  const getContract = () => {
    return contract.current;
  };

  /**
   * 获取募集计划信息
   */
  const getRaiseInfo = withContract(async (contract, id: BigNumberish) => {
    return await contract?.raiseInfo(id);
  });

  /**
   * 获取节点信息
   */
  const getNodeInfo = withContract(async (contract, id: BigNumberish) => {
    return await contract?.nodeInfo(id);
  });

  /**
   * 获取募集计划状态
   */
  const getRaiseState = withContract(async (contract, id: BigNumberish) => {
    return await contract?.raiseState(id);
  });

  /**
   * 获取节点状态
   */
  const getNodeState = withContract(async (contract, id: BigNumberish) => {
    return await contract?.nodeState(id);
  });

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
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract?.unStaking(id, {
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
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract?.raiserWithdraw(id, {
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
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract?.spWithdraw(id, {
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
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract?.investorWithdraw(id, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 获取owner权限
   */
  const getOwner = withContract(async (contract) => {
    return await contract?.gotMiner();
  });

  /**
   * 获取质押总额
   */
  const getTotalPledge = withContract(async (contract, id: BigNumberish) => {
    return await contract?.pledgeTotalAmount(id);
  });

  /**
   * 获取投资人信息
   */
  const getInvestorInfo = withContract(async (contract, id: BigNumberish, address: string) => {
    return await contract?.investorInfo(id, address);
  });

  /**
   * 获取退回资产
   */
  const getBackAssets = withContract(async (contract, id: BigNumberish, address: string) => {
    return await contract?.getBack(id, address);
  });

  /**
   * 获取募集保证金
   */
  const getRaiseFund = withContract(async (contract, id: BigNumberish) => {
    return await contract?.securityFundRemain(id);
  });

  /**
   * 获取运维保证金
   */
  const getOpsFund = withContract(async (contract, id: BigNumberish) => {
    return await contract?.opsSecurityFundRemain(id);
  });

  /**
   * 获取实际配比运维保证金
   */
  const getOpsCalcFund = withContract(async (contract, id: BigNumberish) => {
    return await contract?.opsCalcFund(id);
  });

  /**
   * 获取投资人可提取收益
   */
  const getInvestorAvailableReward = withContract(async (contract, id: BigNumberish, address: string) => {
    return await contract?.availableRewardOf(id, address);
  });

  /**
   * 获取投资人已提取收益
   */
  const getInvestorWithdrawnRecord = withContract(async (contract, id: BigNumberish, address: string) => {
    return await contract?.withdrawRecord(id, address);
  });

  /**
   * 获取投资人待释放收益
   */
  const getInvestorPendingReward = withContract(async (contract, id: BigNumberish, address: string) => {
    return await contract?.willReleaseOf(id, address);
  });

  /**
   * 获取投资人总收益
   */
  const getInvestorTotalReward = withContract(async (contract, id: BigNumberish, address: string) => {
    return await contract?.totalRewardOf(id, address);
  });

  /**
   * 获取募集商已领取的收益
   */
  const getRaiserWithdrawnReward = withContract(async (contract, id: BigNumberish) => {
    return await contract?.gotRaiserReward(id);
  });

  /**
   * 获取募集商可领取的收益
   */
  const getRaiserAvailableReward = withContract(async (contract, id: BigNumberish) => {
    return await contract?.raiserRewardAvailableLeft(id);
  });

  /**
   * 获取募集商待释放的收益
   */
  const getRaiserPendingReward = withContract(async (contract, id: BigNumberish) => {
    return await contract?.raiserWillReleaseReward(id);
  });

  /**
   * 获取服务商已领取的收益
   */
  const getServicerWithdrawnReward = withContract(async (contract, id: BigNumberish) => {
    return await contract?.gotSpReward(id);
  });

  /**
   * 获取服务商可领取的收益
   */
  const getServicerAvailableReward = withContract(async (contract, id: BigNumberish) => {
    return await contract?.spRewardAvailableLeft(id);
  });

  /**
   * 获取服务商待释放的收益
   */
  const getServicerPendingReward = withContract(async (contract, id: BigNumberish) => {
    return await contract?.spWillReleaseReward(id);
  });

  /**
   * 获取服务商罚金
   */
  const getServicerFines = withContract(async (contract, id: BigNumberish) => {
    return await contract?.spFine(id);
  });

  /**
   * 获取服务商锁定收益
   */
  const getServicerLockedReward = withContract(async (contract, id: BigNumberish) => {
    return await contract?.spRewardLock(id);
  });

  /**
   * 获取封装金额
   */
  const getSealedAmount = withContract(async (contract, id: BigNumberish) => {
    return await contract?.sealedAmount(id);
  });

  /**
   * 获取总质押金额
   */
  const getTotalPledgeAmount = withContract(async (contract, id: BigNumberish) => {
    return await contract?.pledgeTotalCalcAmount(id);
  });

  /**
   * 获取总利息
   */
  const getTotalInterest = withContract(async (contract, id: BigNumberish) => {
    return await contract?.totalInterest(id);
  });

  /**
   * 获取节点总收益
   */
  const getTotalReward = withContract(async (contract, id: BigNumberish) => {
    return await contract?.totalRewardAmount(id);
  });

  /**
   * 获取节点待释放的总收益
   */
  const getTotalPendingReward = withContract(async (contract, id: BigNumberish) => {
    return await contract?.totalReleasedRewardAmount(id);
  });

  return {
    staking,
    unStaking,
    closeRaisePlan,
    depositOpsFund,
    depositRaiseFund,
    servicerSign,
    startSeal,
    startRaisePlan,
    withdrawOpsFund,
    withdrawRaiseFund,
    raiserWithdraw,
    servicerWithdraw,
    investorWithdraw,
    getOwner,
    getContract,
    getOpsFund,
    getOpsCalcFund,
    getRaiseFund,
    getNodeInfo,
    getRaiseInfo,
    getNodeState,
    getRaiseState,
    getBackAssets,
    getInvestorInfo,
    getTotalPledge,
    getInvestorAvailableReward,
    getInvestorWithdrawnRecord,
    getInvestorPendingReward,
    getInvestorTotalReward,
    getRaiserAvailableReward,
    getRaiserPendingReward,
    getRaiserWithdrawnReward,
    getServicerAvailableReward,
    getServicerPendingReward,
    getServicerWithdrawnReward,
    getServicerLockedReward,
    getServicerFines,
    getSealedAmount,
    getTotalPledgeAmount,
    getTotalInterest,
    getTotalReward,
    getTotalPendingReward,
  };
}
