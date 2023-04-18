import { useRef } from 'react';
import { ethers } from 'ethers';
import { useMount, useUnmount } from 'ahooks';
import MetaMaskOboarding from '@metamask/onboarding';

import abi from '@/abis/plan.abi.json';
import { withTx } from '@/helpers/app';
import toastify from '@/utils/toastify';
import useAccounts from './useAccounts';
import { createDispatcher, EventType } from '@/utils/mitt';

export type MaybeRef<T> = T | React.MutableRefObject<T>;

export type Options = {
  gas?: ethers.BigNumberish;
  gasLimit?: ethers.BigNumberish;
  gasPrice?: ethers.BigNumberish;
  maxFeePerGas?: ethers.BigNumber;
  maxPriorityFeePerGas?: ethers.BigNumberish;
  value?: ethers.BigNumberish;
};

export enum PlanEventTypes {
  onStaking = 'eStaking',
  onUnstaking = 'eUnstaking',
  onRaiseFailed = 'eRaiseFailed',
  onCloseRaisePlan = 'eCloseRaisePlan',
  onChangeOpsPayer = 'eSpecifyOpsPayer',
  onStartRaisePlan = 'eStartRaisePlan',
  onDepositOPSFund = 'eDepositOPSSecurityFund',
  onWithdrawOPSFund = 'eWithdrawOPSSecurityFund',
  onWithdrawRaiseFund = 'eWithdrawRaiseSecurityFund',
  onRaiserWithdraw = 'eRaiseWithdraw',
  onServicerWithdraw = 'eSPWithdraw',
  onInvestorWithdraw = 'eInvestorWithdraw',
}

const isRef = <T>(val: unknown): val is React.MutableRefObject<T> => Object.prototype.hasOwnProperty.call(val, 'current');

function getRefVal<T>(ref?: MaybeRef<T>) {
  if (ref && isRef(ref)) {
    return ref.current;
  }

  return ref;
}

function createContract(address?: string) {
  if (MetaMaskOboarding.isMetaMaskInstalled() && address) {
    const provider = new ethers.providers.Web3Provider(window.ethereum!);

    const signer = provider.getSigner();

    return new ethers.Contract(address, abi, signer);
  }
}

const events = {
  // 质押
  onStaking: createDispatcher(EventType.onStaking, ['raiseID', 'from', 'to', 'amount']),
  // 解除质押
  onUnstaking: createDispatcher(EventType.onUnstaking, ['raiseID', 'from', 'to', 'amount']),
  // 解除质押
  onRaiseFailed: createDispatcher(EventType.onRaiseFailed, ['raiseID']),
  // 修改保证金支付地址
  onChangeOpsPayer: createDispatcher(EventType.onChangeOpsPayer, ['raiseID', 'caller', 'oldPayer', 'newPayer']),
  // 运维保证金缴纳
  onDepositOPSFund: createDispatcher(EventType.onDepositOPSFund, ['raiseID', 'sender', 'amount']),
  // 募集计划启动
  onStartRaisePlan: createDispatcher(EventType.onStartRaisePlan, ['caller', 'raiseID']),
  // 关闭募集计划
  onCloseRaisePlan: createDispatcher(EventType.onCloseRaisePlan, ['caller', 'raiseID']),
  // 募集商提取收益
  onRaiserWithdraw: createDispatcher(EventType.onRaiserWithdraw, ['raiseID', 'from', 'to', 'amount']),
  // 服务商提取收益
  onServicerWithdraw: createDispatcher(EventType.onServicerWithdraw, ['raiseID', 'from', 'to', 'amount']),
  // 投资人提取收益
  onInvestorWithdraw: createDispatcher(EventType.onInvestorWithdraw, ['raiseID', 'contractAddress', 'from', 'to', 'amount']),
  // 提取运维保证金
  onWithdrawOPSFund: createDispatcher(EventType.onWithdrawOPSFund, ['caller', 'raiseID', 'amount']),
  // 提取募集保证金
  onWithdrawRaiseFund: createDispatcher(EventType.onWithdrawRaiseFund, ['caller', 'raiseID', 'amount']),
};

export default function usePlanContract(address?: MaybeRef<string | undefined>) {
  const contract = useRef(createContract(getRefVal(address)));

  const { withConnect } = useAccounts();

  const bindEvents = () => {
    contract.current?.on(PlanEventTypes.onStaking, events.onStaking);
    contract.current?.on(PlanEventTypes.onUnstaking, events.onUnstaking);
    contract.current?.on(PlanEventTypes.onRaiseFailed, events.onRaiseFailed);
    contract.current?.on(PlanEventTypes.onChangeOpsPayer, events.onChangeOpsPayer);
    contract.current?.on(PlanEventTypes.onCloseRaisePlan, events.onCloseRaisePlan);
    contract.current?.on(PlanEventTypes.onDepositOPSFund, events.onDepositOPSFund);
    contract.current?.on(PlanEventTypes.onStartRaisePlan, events.onStartRaisePlan);
    contract.current?.on(PlanEventTypes.onWithdrawOPSFund, events.onWithdrawOPSFund);
    contract.current?.on(PlanEventTypes.onWithdrawRaiseFund, events.onWithdrawRaiseFund);
    contract.current?.on(PlanEventTypes.onRaiserWithdraw, events.onRaiserWithdraw);
    contract.current?.on(PlanEventTypes.onServicerWithdraw, events.onServicerWithdraw);
    contract.current?.on(PlanEventTypes.onInvestorWithdraw, events.onInvestorWithdraw);
  };

  useMount(bindEvents);

  useUnmount(() => {
    contract.current?.off(PlanEventTypes.onStaking, events.onStaking);
    contract.current?.off(PlanEventTypes.onUnstaking, events.onUnstaking);
    contract.current?.off(PlanEventTypes.onRaiseFailed, events.onRaiseFailed);
    contract.current?.off(PlanEventTypes.onChangeOpsPayer, events.onChangeOpsPayer);
    contract.current?.off(PlanEventTypes.onCloseRaisePlan, events.onCloseRaisePlan);
    contract.current?.off(PlanEventTypes.onDepositOPSFund, events.onDepositOPSFund);
    contract.current?.off(PlanEventTypes.onStartRaisePlan, events.onStartRaisePlan);
    contract.current?.off(PlanEventTypes.onWithdrawOPSFund, events.onWithdrawOPSFund);
    contract.current?.off(PlanEventTypes.onWithdrawRaiseFund, events.onWithdrawRaiseFund);
    contract.current?.off(PlanEventTypes.onRaiserWithdraw, events.onRaiserWithdraw);
    contract.current?.off(PlanEventTypes.onServicerWithdraw, events.onServicerWithdraw);
    contract.current?.off(PlanEventTypes.onInvestorWithdraw, events.onInvestorWithdraw);
  });

  const withContract = <R = any, P extends unknown[] = any>(service: (contract: ethers.Contract | undefined, ...args: P) => Promise<R>) => {
    return async (...args: P) => {
      if (!contract.current) {
        contract.current = createContract(getRefVal(address));

        bindEvents();
      }

      return await service(contract.current, ...args);
    };
  };

  const getContract = (address?: string) => {
    if (address) {
      return createContract(address);
    }

    return contract.current;
  };

  /**
   * 获取募集计划ID
   */
  const getRaiseID = withConnect(
    withContract(async (contract) => {
      return await contract?.raiseID();
    }),
  );

  /**
   * 获取募集计划信息
   */
  const getRaiseInfo = withConnect(
    withContract(async (contract) => {
      return await contract?.raiseInfo();
    }),
  );

  /**
   * 获取节点信息
   */
  const getNodeInfo = withConnect(
    withContract(async (contract) => {
      return await contract?.nodeInfo();
    }),
  );

  /**
   * 获取募集计划状态
   */
  const getRaiseState = withConnect(
    withContract(async (contract) => {
      console.log(contract);
      return await contract?.raiseState();
    }),
  );

  /**
   * 获取节点状态
   */
  const getNodeState = withConnect(
    withContract(async (contract) => {
      return await contract?.nodeState();
    }),
  );

  /**
   * 缴纳运维保证金
   */
  const depositOPSFund = toastify(
    withConnect(
      withTx(
        withContract(async (contract, opts?: Options) => {
          return await contract?.payOpsSecurityFund({
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 指定保证金缴纳地址
   */
  const changeOpsPayer = toastify(
    withConnect(
      withTx(
        withContract(async (contract, address: string, opts?: Options) => {
          return await contract?.specifyOpsPayer(address, {
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
        withContract(async (contract, opts?: Options) => {
          return await contract?.startRaisePlan({
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
        withContract(async (contract, opts?: Options) => {
          return await contract?.closeRaisePlan({
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
        withContract(async (contract, opts?: Options) => {
          return await contract?.staking({
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
        withContract(async (contract, amount: ethers.BigNumber, opts?: Options) => {
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
        withContract(async (contract, opts?: Options) => {
          return await contract?.withdrawRaiseSecurityFund({
            ...opts,
          });
        }),
      ),
    ),
  );

  /**
   * 提取运维保证金
   */
  const withdrawOPSFund = toastify(
    withConnect(
      withTx(
        withContract(async (contract, opts?: Options) => {
          return await contract?.withdrawOPSSecurityFund({
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
        withContract(async (contract, amount: ethers.BigNumber, opts?: Options) => {
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
        withContract(async (contract, amount: ethers.BigNumber, opts?: Options) => {
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
        withContract(async (contract, to: string, amount: ethers.BigNumber, opts?: Options) => {
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
    withContract(async (contract) => {
      return await contract?.pledgeTotalAmount();
    }),
  );

  /**
   * 获取质押金额
   */
  const pledgeAmount = withConnect(
    withContract(async (contract, address: string) => {
      return await contract?.pledgeRecord(address);
    }),
  );

  /**
   * 获取质押累计金额
   */
  const pledgeRecord = withConnect(
    withContract(async (contract, address: string) => {
      return await contract?.pledgeRecordCalc(address);
    }),
  );

  /**
   * 获取募集保证金
   */
  const getRaiseFund = withConnect(
    withContract(async (contract) => {
      return await contract?.securityFundRemainAmount();
    }),
  );

  /**
   * 获取运维保证金
   */
  const getOpsFund = withConnect(
    withContract(async (contract) => {
      return await contract?.opsSecurityFundRemainAmount();
    }),
  );

  /**
   * 获取募集商已领取的收益
   */
  const getRaiserWithdrawnReward = withConnect(
    withContract(async (contract) => {
      return await contract?.gotRaiserReward();
    }),
  );

  /**
   * 获取募集商可领取的收益
   */
  const getRaiserAvailableReward = withConnect(
    withContract(async (contract) => {
      return await contract?.raiserRewardAvailableLeft();
    }),
  );

  /**
   * 获取募集商待释放的收益
   */
  const getRaiserPendingReward = withConnect(
    withContract(async (contract) => {
      return await contract?.raiserWillReleaseReward();
    }),
  );

  /**
   * 获取服务商已领取的收益
   */
  const getServicerWithdrawnReward = withConnect(
    withContract(async (contract) => {
      return await contract?.gotSpReward();
    }),
  );

  /**
   * 获取服务商可领取的收益
   */
  const getServicerAvailableReward = withConnect(
    withContract(async (contract) => {
      return await contract?.spRewardAvailableLeft();
    }),
  );

  /**
   * 获取服务商待释放的收益
   */
  const getServicerPendingReward = withConnect(
    withContract(async (contract) => {
      return await contract?.spWillReleaseReward();
    }),
  );

  /**
   * 获取服务商可领取的收益
   */
  const totalRewardAmount = withConnect(
    withContract(async (contract) => {
      return await contract?.totalRewardAmount();
    }),
  );

  /**
   * 获取服务商待释放的收益
   */
  const totalReleasedRewardAmount = withConnect(
    withContract(async (contract) => {
      return await contract?.totalReleasedRewardAmount();
    }),
  );

  /**
   * 获取投资人总收益
   */
  const totalRewardOf = withConnect(
    withContract(async (contract, address: string) => {
      return await contract?.totalRewardOf(address);
    }),
  );

  /**
   * 获取投资人可提取收益
   */
  const availableRewardOf = withConnect(
    withContract(async (contract, address: string) => {
      return await contract?.availableRewardOf(address);
    }),
  );

  /**
   * 获取投资人待释放收益
   */
  const pendingRewardOf = withConnect(
    withContract(async (contract, address: string) => {
      return await contract?.willReleaseOf(address);
    }),
  );

  /**
   * 获取投资人提取记录
   */
  const withdrawRecord = withConnect(
    withContract(async (contract, address: string) => {
      return await contract?.withdrawRecord(address);
    }),
  );

  return {
    staking,
    unStaking,
    getContract,
    getOpsFund,
    getRaiseFund,
    closeRaisePlan,
    depositOPSFund,
    getRaiseID,
    getNodeInfo,
    getRaiseInfo,
    getNodeState,
    getRaiseState,
    changeOpsPayer,
    startRaisePlan,
    withdrawOPSFund,
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
