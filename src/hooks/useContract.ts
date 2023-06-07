import { useMemo } from 'react';
import { getContract } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

import { isDef } from '@/utils/utils';
import abi from '@/abis/raise.abi.json';
import { toNumber } from '@/utils/format';
import { toastify } from '@/utils/hackify';
import { NodeState, RaiseState } from '@/constants/state';
import { RevertedError } from '@/core/errors/RevertedError';

function toEther(v: unknown) {
  if (isDef(v)) {
    return toNumber(v as number);
  }
}

export default function useContract(address?: API.Address) {
  const publicClient = usePublicClient();
  const walletClient = useWalletClient();

  const contract = useMemo(
    () =>
      address
        ? getContract({
            abi,
            address,
            publicClient,
            walletClient: walletClient.data!,
          })
        : undefined,
    [address],
  );

  const waitTransaction = function <P extends unknown[] = any>(service: (...args: P) => Promise<API.Address | undefined>) {
    return async (...args: P) => {
      const hash = await service(...args);

      if (hash) {
        const res = await publicClient.waitForTransactionReceipt({ hash });

        if (res.status === 'reverted') {
          throw new RevertedError('交易失败', res);
        }

        return res;
      }
    };
  };

  /**
   * 获取Owner权限
   */
  const getOwner = async () => {
    if (contract) return (await contract.read.gotMiner([])) as boolean;
  };

  /**
   * 获取运维保证金
   */
  const getFundOps = async (id: string) => {
    if (contract) return toEther(await contract.read.opsSecurityFundRemain([id]));
  };

  /**
   * 获取总运维保证金
   */
  const getFundOpsCalc = async (id: string) => {
    if (contract) return toEther(await contract.read.opsCalcFund([id]));
  };

  /**
   * 获取主办人保证金
   */
  const getFundRaiser = async (id: string) => {
    if (contract) return toEther(await contract.read.securityFundRemain([id]));
  };

  /**
   * 获取节点状态
   */
  const getNodeState = async (id: string) => {
    if (contract) return (await contract.read.nodeState([id])) as NodeState;
  };

  /**
   * 获取节点计划状态
   */
  const getRaiseState = async (id: string) => {
    if (contract) return (await contract.read.raiseState([id])) as RaiseState;
  };

  /**
   * 获取退回资产
   */
  const getBackAssets = async (id: string, address: string) => {
    if (contract) {
      const res = (await contract.read.getBack([id, address])) as [number, number];

      return res.map(toEther);
    }
  };

  /**
   * 获取建设者信息
   */
  const getInvestorInfo = async (id: string, address: string) => {
    if (contract) {
      const res = (await contract.read.investorInfo([id, address])) as [number, number, number, number];

      return res.map(toEther);
    }
  };

  /**
   * 获取已质押总额
   */
  const getTotalPledge = async (id: string) => {
    if (contract) return toEther(await contract.read.pledgeTotalCalcAmount([id]));
  };

  /**
   * 获取已封装总额
   */
  const getTotalSealed = async (id: string) => {
    if (contract) return toEther(await contract.read.sealedAmount([id]));
  };

  /**
   * 获取节点总节点激励
   */
  const getTotalReward = async (id: string) => {
    if (contract) return toEther(await contract.read.totalRewardAmount([id]));
  };

  /**
   * 获取总利息
   */
  const getTotalInterest = async (id: string) => {
    if (contract) return toEther(await contract.read.totalInterest([id]));
  };

  /**
   * 获取节点待释放的总节点激励
   */
  const getPendingReward = async (id: string) => {
    if (contract) return toEther(await contract.read.totalReleasedRewardAmount([id]));
  };

  /**
   * 获取建设者总节点激励
   */
  const getInvestorTotalReward = async (id: string, address: string) => {
    if (contract) return toEther(await contract.read.totalRewardOf([id, address]));
  };

  /**
   * 获取建设者待释放节点激励
   */
  const getInvestorPendingReward = async (id: string, address: string) => {
    if (contract) return toEther(await contract.read.willReleaseOf([id, address]));
  };

  /**
   * 获取建设者可提取节点激励
   */
  const getInvestorAvailableReward = async (id: string, address: string) => {
    if (contract) return toEther(await contract.read.availableRewardOf([id, address]));
  };

  /**
   * 获取建设者已提取节点激励
   */
  const getInvestorWithdrawnRecord = async (id: string, address: string) => {
    if (contract) return toEther(await contract.read.withdrawRecord([id, address]));
  };

  /**
   * 获取主办人待释放的节点激励
   */
  const getRaiserPendingReward = async (id: string) => {
    if (contract) return toEther(await contract.read.raiserWillReleaseReward([id]));
  };

  /**
   * 获取主办人可领取的节点激励
   */
  const getRaiserAvailableReward = async (id: string) => {
    if (contract) return toEther(await contract.read.raiserRewardAvailableLeft([id]));
  };

  /**
   * 获取主办人已领取的节点激励
   */
  const getRaiserWithdrawnReward = async (id: string) => {
    if (contract) return toEther(await contract.read.gotRaiserReward([id]));
  };

  /**
   * 获取服务商罚金
   */
  const getServicerFines = async (id: string) => {
    if (contract) return toEther(await contract.read.spFine([id]));
  };

  /**
   * 获取服务商锁定节点激励
   */
  const getServicerLockedReward = async (id: string) => {
    if (contract) return toEther(await contract.read.spRewardLock([id]));
  };

  /**
   * 获取服务商待释放的节点激励
   */
  const getServicerPendingReward = async (id: string) => {
    if (contract) return toEther(await contract.read.spWillReleaseReward([id]));
  };

  /**
   * 获取服务商可领取的节点激励
   */
  const getServicerAvailableReward = async (id: string) => {
    if (contract) return toEther(await contract.read.spRewardAvailableLeft([id]));
  };

  /**
   * 获取服务商已领取的节点激励
   */
  const getServicerWithdrawnReward = async (id: string) => {
    if (contract) return toEther(await contract.read.gotSpReward([id]));
  };

  /**
   * 质押
   */
  const staking = toastify(
    waitTransaction(async (id: string, opts?: TxOptions) => {
      if (contract)
        return await contract.write.staking([
          id,
          {
            ...opts,
          },
        ]);
    }),
  );

  /**
   * 解除质押|赎回
   */
  const unStaking = toastify(
    waitTransaction(async (id: string, opts?: TxOptions) => {
      if (contract)
        return await contract.write.unStaking([
          id,
          {
            ...opts,
          },
        ]);
    }),
  );

  /**
   * 缴纳运维保证金
   */
  const depositOpsFund = toastify(
    waitTransaction(async (id: string, opts?: TxOptions) => {
      if (contract)
        return await contract.write.payOpsSecurityFund([
          id,
          {
            ...opts,
          },
        ]);
    }),
  );

  /**
   * 缴纳主办人保证金
   */
  const depositRaiserFund = toastify(
    waitTransaction(async (id: string, opts?: TxOptions) => {
      if (contract)
        return await contract.write.paySecurityFund([
          id,
          {
            ...opts,
          },
        ]);
    }),
  );

  /**
   * 服务商签名
   */
  const servicerSign = toastify(
    waitTransaction(async (opts?: TxOptions) => {
      if (contract)
        return await contract.write.spSignWithMiner([
          {
            ...opts,
          },
        ]);
    }),
  );

  /**
   * 启动预封装
   */
  const startPreSeal = toastify(
    waitTransaction(async (id: string, opts?: TxOptions) => {
      if (contract)
        return await contract.write.startPreSeal([
          id,
          {
            ...opts,
          },
        ]);
    }),
  );

  /**
   * 关闭节点计划
   */
  const closeRaisePlan = toastify(
    waitTransaction(async (id: string, opts?: TxOptions) => {
      if (contract)
        return await contract.write.closeRaisePlan([
          id,
          {
            ...opts,
          },
        ]);
    }),
  );

  /**
   * 启动节点计划
   */
  const startRaisePlan = toastify(
    waitTransaction(async (id: string, opts?: TxOptions) => {
      if (contract)
        return await contract.write.startRaisePlan([
          id,
          {
            ...opts,
          },
        ]);
    }),
  );

  /**
   * 主办人提取节点激励
   */
  const raiserWithdraw = toastify(
    waitTransaction(async (id: string, opts?: TxOptions) => {
      if (contract)
        return await contract.write.raiserWithdraw([
          id,
          {
            ...opts,
          },
        ]);
    }),
  );

  /**
   * 建设者提取节点激励
   */
  const investorWithdraw = toastify(
    waitTransaction(async (id: string, opts?: TxOptions) => {
      if (contract)
        return await contract.write.investorWithdraw([
          id,
          {
            ...opts,
          },
        ]);
    }),
  );

  /**
   * 服务商提取节点激励
   */
  const servicerWithdraw = toastify(
    waitTransaction(async (id: string, opts?: TxOptions) => {
      if (contract)
        return await contract.write.spWithdraw([
          id,
          {
            ...opts,
          },
        ]);
    }),
  );

  /**
   * 提取运维保证金
   */
  const withdrawOpsFund = toastify(
    waitTransaction(async (id: string, opts?: TxOptions) => {
      if (contract)
        return await contract.write.withdrawOpsSecurityFund([
          id,
          {
            ...opts,
          },
        ]);
    }),
  );

  /**
   * 提取主办人保证金
   */
  const withdrawRaiserFund = toastify(
    waitTransaction(async (id: string, opts?: TxOptions) => {
      if (contract)
        return await contract.write.withdrawSecurityFund([
          id,
          {
            ...opts,
          },
        ]);
    }),
  );

  return {
    getOwner,
    getFundOps,
    getFundOpsCalc,
    getFundRaiser,
    getNodeState,
    getRaiseState,
    getBackAssets,
    getInvestorInfo,
    getTotalPledge,
    getTotalSealed,
    getTotalReward,
    getTotalInterest,
    getPendingReward,
    getRaiserPendingReward,
    getRaiserAvailableReward,
    getRaiserWithdrawnReward,
    getInvestorTotalReward,
    getInvestorPendingReward,
    getInvestorAvailableReward,
    getInvestorWithdrawnRecord,
    getServicerFines,
    getServicerLockedReward,
    getServicerPendingReward,
    getServicerAvailableReward,
    getServicerWithdrawnReward,
    staking,
    unStaking,
    startPreSeal,
    closeRaisePlan,
    startRaisePlan,
    depositOpsFund,
    depositRaiserFund,
    servicerSign,
    raiserWithdraw,
    investorWithdraw,
    servicerWithdraw,
    withdrawOpsFund,
    withdrawRaiserFund,
  };
}
