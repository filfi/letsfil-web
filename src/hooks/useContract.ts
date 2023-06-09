import { usePublicClient /* useWalletClient */ } from 'wagmi';
// import type { Account } from 'viem';

import { isDef } from '@/utils/utils';
import { toNumber } from '@/utils/format';
import { toastify } from '@/utils/hackify';
import { RAISE_ADDRESS } from '@/constants';
import raiseAbi from '@/abis/raise.abi.json';
import factoryAbi from '@/abis/factory.abi.json';
import { NodeState, RaiseState } from '@/constants/state';
// import { RevertedError } from '@/core/errors/RevertedError';
import { writeContract as ethersContract } from '@/core/contract/write';
import type { WriteContractOptions } from '@/core/contract/write';

export type WriteOptions = TxOptions & {
  // account?: Account;
  address?: API.Address;
};

function toEther(v: unknown) {
  if (isDef(v)) {
    return toNumber(v as number);
  }
}

export default function useContract(address?: API.Address) {
  const publicClient = usePublicClient();
  // const { data: walletClient } = useWalletClient();

  // const waitTransaction = function <P extends unknown[] = any>(service: (...args: P) => Promise<API.Address | string | undefined>) {
  //   return async (...args: P) => {
  //     const hash = (await service(...args)) as API.Address;

  //     if (hash) {
  //       const res = await publicClient.waitForTransactionReceipt({ hash });

  //       console.log(res);

  //       if (res.status === 'reverted') {
  //         throw new RevertedError('交易失败', res);
  //       }

  //       return res;
  //     }
  //   };
  // };

  const readContract = async function <R = any, P extends unknown[] = any>(functionName: string, args: P, _address?: API.Address) {
    const addr = _address ?? address;

    if (!addr) return;

    const res = await publicClient.readContract({
      args,
      functionName,
      abi: raiseAbi,
      address: addr,
    });

    return res as R;
  };

  // const writeContract = async function <P extends unknown[] = any>(
  //   functionName: string,
  //   args: P,
  //   { account: _account, abi: _abi, address: _address, ...opts }: WriteOptions & { abi?: any } = {},
  // ) {
  //   const abi = _abi ?? raiseAbi;
  //   const addr = _address ?? address;

  //   if (!addr || !walletClient) return;

  //   // publicClient.e

  //   const account = _account ?? walletClient.account;
  //   const gas = await publicClient.estimateContractGas({
  //     abi,
  //     args,
  //     account,
  //     functionName,
  //     address: addr,
  //     ...opts,
  //   });

  //   const params = {
  //     abi,
  //     gas,
  //     args,
  //     account,
  //     functionName,
  //     address: addr,
  //     ...(opts as any),
  //   };

  //   console.log(params);

  //   return await waitTransaction(walletClient.writeContract)(params);
  // };

  const writeContract = async function <P extends unknown[] = any>(
    functionName: string,
    args: P,
    { abi: _abi, address: _address, ...opts }: Partial<Omit<WriteContractOptions<string, P>, 'args' | 'functionName'>> = {},
  ) {
    const abi = _abi ?? raiseAbi;
    const addr = _address ?? address;

    if (!addr) return;

    const params = {
      abi,
      args,
      functionName,
      address: addr,
      ...opts,
    };

    console.log({ ...params });

    const res = await ethersContract(params);
    return res;
  };

  // const writeContract = async function <P extends unknown[] = any>(
  //   functionName: string,
  //   args: P,
  //   { account: _account, abi: _abi, address: _address, ...opts }: WriteOptions & { abi?: any } = {},
  // ) {
  //   const abi = _abi ?? raiseAbi;
  //   const addr = _address ?? address;

  //   if (!addr || !walletClient) return;

  //   const account = _account ?? walletClient?.account;

  //   const params = {
  //     abi,
  //     args,
  //     account,
  //     functionName,
  //     address: addr,
  //     ...opts,
  //   };

  //   const gas = await publicClient.estimateContractGas(params);

  //   console.log({ ...params, gas });

  //   return await waitTransaction(walletClient.writeContract)({ ...params, gas });
  // };

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
   * 获取质押金额
   */
  const getPledgeAmount = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('pledgeTotalAmount', [id], _address));
  };

  /**
   * 获取封装金额
   */
  const getSealedAmount = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('toSealAmount', [id], _address));
  };

  /**
   * 获取质押总额
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
   * 获取运维保证金罚金
   */
  const getOpsFines = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('spFundFine', [id], _address));
  };

  /**
   * 获取运维保证金收益罚金
   */
  const getOpsRewardFines = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('spFundRewardFine', [id], _address));
  };

  /**
   * 获取服务商总罚金
   */
  const getServicerFines = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('spFine', [id], _address));
  };

  /**
   * 获取服务商收益罚金
   */
  const getServicerFinesReward = async (id: string, _address = address) => {
    return toEther(await readContract<bigint>('spRewardFine', [id], _address));
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
  const staking = toastify(async (id: string, opts?: WriteOptions) => {
    return await writeContract('staking', [id], opts);
  });

  /**
   * 解除质押|赎回
   */
  const unStaking = toastify(async (id: string, opts?: WriteOptions) => {
    return await writeContract('unStaking', [id], opts);
  });

  /**
   * 缴纳运维保证金
   */
  const depositOpsFund = toastify(async (id: string, opts?: WriteOptions) => {
    return await writeContract('payOpsSecurityFund', [id], opts);
  });

  /**
   * 缴纳主办人保证金
   */
  const depositRaiserFund = toastify(async (id: string, opts?: WriteOptions) => {
    return await writeContract('paySecurityFund', [id], opts);
  });

  /**
   * 服务商签名
   */
  const servicerSign = toastify(async (opts?: WriteOptions) => {
    return await writeContract('spSignWithMiner', [], opts);
  });

  /**
   * 启动预封装
   */
  const startPreSeal = toastify(async (id: string, opts?: WriteOptions) => {
    return await writeContract('startPreSeal', [id], opts);
  });

  /**
   * 关闭节点计划
   */
  const closeRaisePlan = toastify(async (id: string, opts?: WriteOptions) => {
    return await writeContract('closeRaisePlan', [id], opts);
  });

  /**
   * 创建节点计划
   */
  const createRaisePlan = toastify(async (raise: RaiseInfo, node: NodeInfo, extra: ExtraInfo, opts?: Omit<TxOptions, 'abi' | 'address'>) => {
    console.log(raise, node, extra);
    return await writeContract('createRaisePlan', [raise, node, extra], {
      ...opts,
      abi: factoryAbi,
      address: RAISE_ADDRESS,
    });
  });

  /**
   * 启动节点计划
   */
  const startRaisePlan = toastify(async (id: string, opts?: WriteOptions) => {
    return await writeContract('startRaisePlan', [id], opts);
  });

  /**
   * 主办人提取节点激励
   */
  const raiserWithdraw = toastify(async (id: string, opts?: WriteOptions) => {
    return await writeContract('raiserWithdraw', [id], opts);
  });

  /**
   * 建设者提取节点激励
   */
  const investorWithdraw = toastify(async (id: string, opts?: WriteOptions) => {
    return await writeContract('investorWithdraw', [id], opts);
  });

  /**
   * 服务商提取节点激励
   */
  const servicerWithdraw = toastify(async (id: string, opts?: WriteOptions) => {
    return await writeContract('spWithdraw', [id], opts);
  });

  /**
   * 提取运维保证金
   */
  const withdrawOpsFund = toastify(async (id: string, opts?: WriteOptions) => {
    return await writeContract('withdrawOpsSecurityFund', [id], opts);
  });

  /**
   * 提取主办人保证金
   */
  const withdrawRaiserFund = toastify(async (id: string, opts?: WriteOptions) => {
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
    getPledgeAmount,
    getSealedAmount,
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
    getOpsFines,
    getOpsRewardFines,
    getServicerFines,
    getServicerFinesReward,
    getServicerLockedReward,
    getServicerPendingReward,
    getServicerAvailableReward,
    getServicerWithdrawnReward,
    staking,
    unStaking,
    startPreSeal,
    closeRaisePlan,
    startRaisePlan,
    createRaisePlan,
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
