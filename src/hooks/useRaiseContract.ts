import { useMemo, useRef } from 'react';
import { useUnmount, useUpdateEffect } from 'ahooks';
import type { Contract, BigNumber, BigNumberish } from 'ethers';

import { isRef } from '@/utils/utils';
import useAccounts from './useAccounts';
import { toastify } from '@/utils/hackify';
import { createContract, withTx } from '@/helpers/app';
import { NodeState, RaiseState } from '@/constants/state';
import { createDispatcher, EventType } from '@/utils/mitt';

export enum RaiseEventTypes {
  onStaking = 'Staking',
  onStartSeal = 'StartSeal',
  onUnstaking = 'Unstaking',
  onDestroyNode = 'DestroyNode',
  onRaiseFailed = 'RaiseFailed',
  onStartPreSeal = 'StartPreSeal',
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

const handlers = {
  // 质押
  onStaking: createDispatcher(EventType.onStaking, ['raiseID', 'from', 'to', 'amount']),
  // 启动封装
  onStartSeal: createDispatcher(EventType.onStaking, ['raiseID', 'sender', 'time']),
  // 解除质押
  onUnstaking: createDispatcher(EventType.onUnstaking, ['raiseID', 'from', 'to', 'amount']),
  // 节点结束
  onDestroyNode: createDispatcher(EventType.onDepositOpsFund, ['raiseID', 'state']),
  // 集合质押失败
  onRaiseFailed: createDispatcher(EventType.onRaiseFailed, ['raiseID']),
  // 启动预封装
  onStartPreSeal: createDispatcher(EventType.onStartPreSeal, ['raiseID', 'caller']),
  // 运维保证金缴纳
  onDepositRaiseFund: createDispatcher(EventType.onDepositRaiseFund, ['raiseID', 'sender', 'amount']),
  // 运维保证金缴纳
  onDepositOpsFund: createDispatcher(EventType.onDepositOpsFund, ['raiseID', 'sender', 'amount']),
  // 服务商已签名
  onServicerSigned: createDispatcher(EventType.onServicerSigned, ['raiseID', 'sender', 'minerId', 'oldOwner', 'contract']),
  // 节点计划启动
  onStartRaisePlan: createDispatcher(EventType.onStartRaisePlan, ['raiseID', 'sendar', 'time']),
  // 关闭节点计划
  onCloseRaisePlan: createDispatcher(EventType.onCloseRaisePlan, ['caller', 'raiseID']),
  // 建设者提取节点激励
  onRaiserWithdraw: createDispatcher(EventType.onRaiserWithdraw, ['raiseID', 'from', 'to', 'amount']),
  // 服务商提取节点激励
  onServicerWithdraw: createDispatcher(EventType.onServicerWithdraw, ['raiseID', 'from', 'to', 'amount']),
  // 参建者提取节点激励
  onInvestorWithdraw: createDispatcher(EventType.onInvestorWithdraw, ['raiseID', 'from', 'to', 'amount']),
  // 提取运维保证金
  onWithdrawOpsFund: createDispatcher(EventType.onWithdrawOpsFund, ['raiseID', 'sender', 'amount']),
  // 提取建设者保证金
  onWithdrawRaiseFund: createDispatcher(EventType.onWithdrawRaiseFund, ['raiseID', 'sender', 'amount']),
  // 节点状态变更
  onNodeStateChange: createDispatcher(EventType.onNodeStateChange, ['raiseID', 'state']),
  // 节点计划状态变更
  onRaiseStateChange: createDispatcher(EventType.onRaiseStateChange, ['raiseID', 'state']),
};

function getRefVal<T>(ref?: MaybeRef<T>) {
  if (ref && isRef(ref)) {
    return ref.current;
  }

  return ref;
}

function bindEvents(contract?: Contract) {
  contract?.on(RaiseEventTypes.onStaking, handlers.onStaking);
  contract?.on(RaiseEventTypes.onStartSeal, handlers.onStartSeal);
  contract?.on(RaiseEventTypes.onUnstaking, handlers.onUnstaking);
  contract?.on(RaiseEventTypes.onDestroyNode, handlers.onDestroyNode);
  contract?.on(RaiseEventTypes.onRaiseFailed, handlers.onRaiseFailed);
  contract?.on(RaiseEventTypes.onStartPreSeal, handlers.onStartPreSeal);
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
}

function unbindEvent(contract?: Contract) {
  contract?.off(RaiseEventTypes.onStaking, handlers.onStaking);
  contract?.off(RaiseEventTypes.onStartSeal, handlers.onStartSeal);
  contract?.off(RaiseEventTypes.onUnstaking, handlers.onUnstaking);
  contract?.off(RaiseEventTypes.onDestroyNode, handlers.onDestroyNode);
  contract?.off(RaiseEventTypes.onRaiseFailed, handlers.onRaiseFailed);
  contract?.off(RaiseEventTypes.onStartPreSeal, handlers.onStartPreSeal);
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
}
function createRaiseContract(address?: string) {
  const contract = createContract(address);

  bindEvents(contract);

  return contract;
}

export default function useRaiseContract(address?: MaybeRef<string | undefined>) {
  const { withConnect } = useAccounts();
  const rawAddr = useMemo(() => getRefVal(address), [address]);
  const contract = useRef(createRaiseContract(rawAddr));

  const initContract = () => {
    if (rawAddr && (!contract.current || contract.current.address !== rawAddr)) {
      contract.current = createContract(rawAddr);
    }
  };

  useUpdateEffect(initContract, [rawAddr]);

  useUnmount(() => unbindEvent(contract.current));

  const withContract = <R = any, P extends unknown[] = any>(service: (contract: Contract, ...args: P) => Promise<R>) => {
    return async (...args: P) => {
      if (contract.current) {
        return await service(contract.current, ...args);
      }
    };
  };

  const getContract = () => {
    return contract.current;
  };

  /**
   * 获取节点计划信息
   */
  const getRaiseInfo = withContract(async (contract, id: BigNumberish): Promise<RaiseInfo> => {
    return await contract.raiseInfo(id);
  });

  /**
   * 获取节点信息
   */
  const getNodeInfo = withContract(async (contract, id: BigNumberish): Promise<NodeInfo> => {
    return await contract.nodeInfo(id);
  });

  /**
   * 获取节点计划状态
   */
  const getRaiseState = withContract(async (contract, id: BigNumberish): Promise<RaiseState> => {
    return await contract.raiseState(id);
  });

  /**
   * 获取节点状态
   */
  const getNodeState = withContract(async (contract, id: BigNumberish): Promise<NodeState> => {
    return await contract.nodeState(id);
  });

  /**
   * 缴纳建设者保证金
   */
  const depositRaiseFund = toastify(
    withConnect(
      withTx(
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract.paySecurityFund(id, {
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
          return await contract.payOpsSecurityFund(id, {
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
          return await contract.spSignWithMiner({
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
          return await contract.startSeal(id, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 启动预封装
   */
  const startPreSeal = toastify(
    withConnect(
      withTx(
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract.startPreSeal(id, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 启动节点计划
   */
  const startRaisePlan = toastify(
    withConnect(
      withTx(
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract.startRaisePlan(id, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 关闭节点计划
   */
  const closeRaisePlan = toastify(
    withConnect(
      withTx(
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract.closeRaisePlan(id, {
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
          return await contract.staking(id, {
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
          return await contract.unStaking(id, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 提取建设者保证金
   */
  const withdrawRaiseFund = toastify(
    withConnect(
      withTx(
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract.withdrawSecurityFund(id, {
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
          return await contract.withdrawOpsSecurityFund(id, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 建设者提取节点激励
   */
  const raiserWithdraw = toastify(
    withConnect(
      withTx(
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract.raiserWithdraw(id, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 服务商提取节点激励
   */
  const servicerWithdraw = toastify(
    withConnect(
      withTx(
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract.spWithdraw(id, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 参建者提取节点激励
   */
  const investorWithdraw = toastify(
    withConnect(
      withTx(
        withContract(async (contract, id: BigNumberish, opts?: TxOptions) => {
          return await contract.investorWithdraw(id, {
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 获取owner权限
   */
  const getOwner = withContract(async (contract): Promise<boolean> => {
    return await contract.gotMiner();
  });

  /**
   * 获取质押总额
   */
  const getTotalPledge = withContract(async (contract, id: BigNumberish): Promise<BigNumber> => {
    return await contract.pledgeTotalAmount(id);
  });

  /**
   * 获取参建者信息
   */
  const getInvestorInfo = withContract(async (contract, id: BigNumberish, address: string): Promise<InvestorInfo> => {
    return await contract.investorInfo(id, address);
  });

  /**
   * 获取退回资产
   */
  const getBackAssets = withContract(async (contract, id: BigNumberish, address: string): Promise<[BigNumber, BigNumber]> => {
    return await contract.getBack(id, address);
  });

  /**
   * 获取建设者保证金
   */
  const getRaiseFund = withContract(async (contract, id: BigNumberish): Promise<BigNumber> => {
    return await contract.securityFundRemain(id);
  });

  /**
   * 获取运维保证金
   */
  const getOpsFund = withContract(async (contract, id: BigNumberish): Promise<BigNumber> => {
    return await contract.opsSecurityFundRemain(id);
  });

  /**
   * 获取实际配比运维保证金
   */
  const getOpsCalcFund = withContract(async (contract, id: BigNumberish): Promise<BigNumber> => {
    return await contract.opsCalcFund(id);
  });

  /**
   * 获取参建者可提取节点激励
   */
  const getInvestorAvailableReward = withContract(async (contract, id: BigNumberish, address: string): Promise<BigNumber> => {
    return await contract.availableRewardOf(id, address);
  });

  /**
   * 获取参建者已提取节点激励
   */
  const getInvestorWithdrawnRecord = withContract(async (contract, id: BigNumberish, address: string): Promise<BigNumber> => {
    return await contract.withdrawRecord(id, address);
  });

  /**
   * 获取参建者待释放节点激励
   */
  const getInvestorPendingReward = withContract(async (contract, id: BigNumberish, address: string): Promise<BigNumber> => {
    return await contract.willReleaseOf(id, address);
  });

  /**
   * 获取参建者总节点激励
   */
  const getInvestorTotalReward = withContract(async (contract, id: BigNumberish, address: string): Promise<BigNumber> => {
    return await contract.totalRewardOf(id, address);
  });

  /**
   * 获取建设者已领取的节点激励
   */
  const getRaiserWithdrawnReward = withContract(async (contract, id: BigNumberish): Promise<BigNumber> => {
    return await contract.gotRaiserReward(id);
  });

  /**
   * 获取建设者可领取的节点激励
   */
  const getRaiserAvailableReward = withContract(async (contract, id: BigNumberish): Promise<BigNumber> => {
    return await contract.raiserRewardAvailableLeft(id);
  });

  /**
   * 获取建设者待释放的节点激励
   */
  const getRaiserPendingReward = withContract(async (contract, id: BigNumberish): Promise<BigNumber> => {
    return await contract.raiserWillReleaseReward(id);
  });

  /**
   * 获取服务商已领取的节点激励
   */
  const getServicerWithdrawnReward = withContract(async (contract, id: BigNumberish): Promise<BigNumber> => {
    return await contract.gotSpReward(id);
  });

  /**
   * 获取服务商可领取的节点激励
   */
  const getServicerAvailableReward = withContract(async (contract, id: BigNumberish): Promise<BigNumber> => {
    return await contract.spRewardAvailableLeft(id);
  });

  /**
   * 获取服务商待释放的节点激励
   */
  const getServicerPendingReward = withContract(async (contract, id: BigNumberish): Promise<BigNumber> => {
    return await contract.spWillReleaseReward(id);
  });

  /**
   * 获取服务商罚金
   */
  const getServicerFines = withContract(async (contract, id: BigNumberish): Promise<BigNumber> => {
    return await contract.spFine(id);
  });

  /**
   * 获取服务商锁定节点激励
   */
  const getServicerLockedReward = withContract(async (contract, id: BigNumberish): Promise<BigNumber> => {
    return await contract.spRewardLock(id);
  });

  /**
   * 获取封装金额
   */
  const getSealedAmount = withContract(async (contract, id: BigNumberish): Promise<BigNumber> => {
    return await contract.sealedAmount(id);
  });

  /**
   * 获取总质押金额
   */
  const getTotalPledgeAmount = withContract(async (contract, id: BigNumberish): Promise<BigNumber> => {
    return await contract.pledgeTotalCalcAmount(id);
  });

  /**
   * 获取总利息
   */
  const getTotalInterest = withContract(async (contract, id: BigNumberish): Promise<BigNumber> => {
    return await contract.totalInterest(id);
  });

  /**
   * 获取节点总节点激励
   */
  const getTotalReward = withContract(async (contract, id: BigNumberish): Promise<BigNumber> => {
    return await contract.totalRewardAmount(id);
  });

  /**
   * 获取节点待释放的总节点激励
   */
  const getTotalPendingReward = withContract(async (contract, id: BigNumberish): Promise<BigNumber> => {
    return await contract.totalReleasedRewardAmount(id);
  });

  return {
    staking,
    unStaking,
    closeRaisePlan,
    depositOpsFund,
    depositRaiseFund,
    servicerSign,
    startSeal,
    startPreSeal,
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
