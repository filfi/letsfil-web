import { usePublicClient, useWalletClient } from 'wagmi';
import { Account } from 'viem';

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
  const { data: walletClient } = useWalletClient();

  const waitTransaction = function <P extends unknown[] = any>(service: (...args: P) => Promise<API.Address | undefined>) {
    return async (...args: P) => {
      const hash = await service(...args);

      if (hash) {
        const res = await publicClient.waitForTransactionReceipt({ hash });

        console.log(res);

        if (res.status === 'reverted') {
          throw new RevertedError('交易失败', res);
        }

        return res;
      }
    };
  };

  const readContract = async function <R = any, P extends unknown[] = any>(functionName: string, args: P, _address?: API.Address) {
    const addr = _address ?? address;

    if (!addr) return;

    const res = await publicClient.readContract({
      abi,
      args,
      functionName,
      address: addr,
    });

    return res as R;
  };

  const writeContract = async function <P extends unknown[] = any>(
    functionName: string,
    args: P,
    { account, address: _address, ...opts }: TxOptions & { address?: API.Address; account?: Account } = {},
  ) {
    const addr = _address ?? address;

    if (!addr || !walletClient) return;

    return await waitTransaction(walletClient.writeContract)({
      abi,
      args,
      account,
      functionName,
      address: addr,
      ...(opts as any),
    });
  };

  /**
   * 获取Owner权限
   */
  const getOwner = async (_address = address) => {
    return await readContract<boolean>('gotMiner', [], _address);
  };

  /**
   * 获取运维保证金
   */
  const getFundOps = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('opsSecurityFundRemain', [id], _address));
  };

  /**
   * 获取总运维保证金
   */
  const getFundOpsCalc = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('opsCalcFund', [id], _address));
  };

  /**
   * 获取主办人保证金
   */
  const getFundRaiser = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('securityFundRemain', [id], _address));
  };

  /**
   * 获取节点状态
   */
  const getNodeState = async (id: string, _address = address) => {
    return await readContract<NodeState>('nodeState', [id], _address);
  };

  /**
   * 获取节点计划状态
   */
  const getRaiseState = async (id: string, _address = address) => {
    return await readContract<RaiseState>('raiseState', [id], _address);
  };

  /**
   * 获取退回资产
   */
  const getBackAssets = async (id: string, account: string, _address = address) => {
    const res = await readContract<[bigint, bigint]>('getBack', [id, account], _address);

    if (res) {
      return res.map(toEther) as [number, number];
    }
  };

  /**
   * 获取建设者信息
   */
  const getInvestorInfo = async (id: string, account: string, _address = address) => {
    const res = await readContract<[bigint, bigint, bigint, bigint]>('investorInfo', [id, account], _address);

    if (res) {
      return res.map(toEther) as [number, number, number, number];
    }
  };

  /**
   * 获取已质押总额
   */
  const getTotalPledge = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('pledgeTotalCalcAmount', [id], _address));
  };

  /**
   * 获取已封装总额
   */
  const getTotalSealed = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('sealedAmount', [id], _address));
  };

  /**
   * 获取节点总节点激励
   */
  const getTotalReward = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('totalRewardAmount', [id], _address));
  };

  /**
   * 获取总利息
   */
  const getTotalInterest = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('totalInterest', [id], _address));
  };

  /**
   * 获取节点待释放的总节点激励
   */
  const getPendingReward = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('totalReleasedRewardAmount', [id], _address));
  };

  /**
   * 获取建设者总节点激励
   */
  const getInvestorTotalReward = async (id: string, account: string, _address = address) => {
    return toEther(await readContract<bigint>('totalRewardOf', [id, account], _address));
  };

  /**
   * 获取建设者待释放节点激励
   */
  const getInvestorPendingReward = async (id: string, account: string, _address = address) => {
    return toEther(await readContract<bigint>('willReleaseOf', [id, account], _address));
  };

  /**
   * 获取建设者可提取节点激励
   */
  const getInvestorAvailableReward = async (id: string, account: string, _address = address) => {
    return toEther(await readContract<bigint>('availableRewardOf', [id, account], _address));
  };

  /**
   * 获取建设者已提取节点激励
   */
  const getInvestorWithdrawnRecord = async (id: string, account: string, _address = address) => {
    return toEther(await readContract<bigint>('withdrawRecord', [id, account], _address));
  };

  /**
   * 获取主办人待释放的节点激励
   */
  const getRaiserPendingReward = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('raiserWillReleaseReward', [id], _address));
  };

  /**
   * 获取主办人可领取的节点激励
   */
  const getRaiserAvailableReward = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('raiserRewardAvailableLeft', [id], _address));
  };

  /**
   * 获取主办人已领取的节点激励
   */
  const getRaiserWithdrawnReward = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('gotRaiserReward', [id], _address));
  };

  /**
   * 获取服务商罚金
   */
  const getServicerFines = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('spFine', [id], _address));
  };

  /**
   * 获取服务商锁定节点激励
   */
  const getServicerLockedReward = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('spRewardLock', [id], _address));
  };

  /**
   * 获取服务商待释放的节点激励
   */
  const getServicerPendingReward = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('spWillReleaseReward', [id], _address));
  };

  /**
   * 获取服务商可领取的节点激励
   */
  const getServicerAvailableReward = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('spRewardAvailableLeft', [id], _address));
  };

  /**
   * 获取服务商已领取的节点激励
   */
  const getServicerWithdrawnReward = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('gotSpReward', [id], _address));
  };

  /**
   * 质押
   */
  const staking = toastify(async (id: string, opts?: TxOptions) => {
    return await writeContract('staking', [id], opts);
  });

  /**
   * 解除质押|赎回
   */
  const unStaking = toastify(async (id: string, opts?: TxOptions) => {
    return await writeContract('unStaking', [id], opts);
  });

  /**
   * 缴纳运维保证金
   */
  const depositOpsFund = toastify(async (id: string, opts?: TxOptions) => {
    return await writeContract('payOpsSecurityFund', [id], opts);
  });

  /**
   * 缴纳主办人保证金
   */
  const depositRaiserFund = toastify(async (id: string, opts?: TxOptions) => {
    return await writeContract('paySecurityFund', [id], opts);
  });

  /**
   * 服务商签名
   */
  const servicerSign = toastify(async (opts?: TxOptions) => {
    return await writeContract('spSignWithMiner', [], opts);
  });

  /**
   * 启动预封装
   */
  const startPreSeal = toastify(async (id: string, opts?: TxOptions) => {
    return await writeContract('startPreSeal', [id], opts);
  });

  /**
   * 关闭节点计划
   */
  const closeRaisePlan = toastify(async (id: string, opts?: TxOptions) => {
    return await writeContract('closeRaisePlan', [id], opts);
  });

  /**
   * 启动节点计划
   */
  const startRaisePlan = toastify(async (id: string, opts?: TxOptions) => {
    return await writeContract('startRaisePlan', [id], opts);
  });

  /**
   * 主办人提取节点激励
   */
  const raiserWithdraw = toastify(async (id: string, opts?: TxOptions) => {
    return await writeContract('raiserWithdraw', [id], opts);
  });

  /**
   * 建设者提取节点激励
   */
  const investorWithdraw = toastify(async (id: string, opts?: TxOptions) => {
    return await writeContract('investorWithdraw', [id], opts);
  });

  /**
   * 服务商提取节点激励
   */
  const servicerWithdraw = toastify(async (id: string, opts?: TxOptions) => {
    return await writeContract('spWithdraw', [id], opts);
  });

  /**
   * 提取运维保证金
   */
  const withdrawOpsFund = toastify(async (id: string, opts?: TxOptions) => {
    return await writeContract('withdrawOpsSecurityFund', [id], opts);
  });

  /**
   * 提取主办人保证金
   */
  const withdrawRaiserFund = toastify(async (id: string, opts?: TxOptions) => {
    return await writeContract('withdrawSecurityFund', [id], opts);
  });

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
