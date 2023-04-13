import { useRef } from 'react';
import { BigNumber, ethers } from 'ethers';
import { useMount, useUnmount } from 'ahooks';
import MetaMaskOboarding from '@metamask/onboarding';

import abi from '@/abis/plan.abi.json';
import toastify from '@/utils/toastify';
import useAccounts from './useAccounts';
import { withGas, withTx } from '@/helpers/app';
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
  onStartRaisePlan = 'eStartRaisePlan',
  onDepositOPSFund = 'eDepositOPSSecurityFund',
  onWithdrawOPSFund = 'eWithdrawOPSSecurityFund',
  onWithdrawRaiseFund = 'eWithdrawRaiseSecurityFund',
}

const isRef = <T>(val: unknown): val is React.MutableRefObject<T> => Object.prototype.hasOwnProperty.call(val, 'current');

function getRefVal<T>(ref?: MaybeRef<T>) {
  if (ref && isRef(ref)) {
    return ref.current;
  }

  return ref;
}

function getMaxFeePerGas(from: number | string) {
  return BigNumber.from(from).add(200).toHexString();
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
  onStaking: createDispatcher(EventType.OnStaking, ['raiseID', 'from', 'to', 'amount']),
  // 解除质押
  onUnstaking: createDispatcher(EventType.OnUnstaking, ['raiseID', 'from', 'to', 'amount']),
  // 解除质押
  onRaiseFailed: createDispatcher(EventType.OnRaiseFailed, ['raiseID']),
  // 运维保证金缴纳
  onDepositOPSFund: createDispatcher(EventType.OnDepositOPSFund, ['raiseID', 'sender', 'amount']),
  // 募集计划启动
  onStartRaisePlan: createDispatcher(EventType.OnStartRaisePlan, ['caller', 'raiseID']),
  // 关闭募集计划
  onCloseRaisePlan: createDispatcher(EventType.OnCloseRaisePlan, ['caller', 'raiseID']),
  // 提取运维保证金
  onWithdrawOPSFund: createDispatcher(EventType.OnWithdrawOPSFund, ['caller', 'raiseID', 'amount']),
  // 提取募集保证金
  onWithdrawRaiseFund: createDispatcher(EventType.OnWithdrawRaiseFund, ['caller', 'raiseID', 'amount']),
};

export default function usePlanContract(address?: MaybeRef<string | undefined>) {
  const contract = useRef(createContract(getRefVal(address)));

  const { withConnect } = useAccounts();

  const bindEvents = () => {
    contract.current?.on(PlanEventTypes.onStaking, events.onStaking);
    contract.current?.on(PlanEventTypes.onUnstaking, events.onUnstaking);
    contract.current?.on(PlanEventTypes.onRaiseFailed, events.onRaiseFailed);
    contract.current?.on(PlanEventTypes.onCloseRaisePlan, events.onCloseRaisePlan);
    contract.current?.on(PlanEventTypes.onDepositOPSFund, events.onDepositOPSFund);
    contract.current?.on(PlanEventTypes.onStartRaisePlan, events.onStartRaisePlan);
    contract.current?.on(PlanEventTypes.onWithdrawOPSFund, events.onWithdrawOPSFund);
    contract.current?.on(PlanEventTypes.onWithdrawRaiseFund, events.onWithdrawRaiseFund);
  };

  useMount(bindEvents);

  useUnmount(() => {
    contract.current?.off(PlanEventTypes.onStaking, events.onStaking);
    contract.current?.off(PlanEventTypes.onUnstaking, events.onUnstaking);
    contract.current?.off(PlanEventTypes.onRaiseFailed, events.onRaiseFailed);
    contract.current?.off(PlanEventTypes.onCloseRaisePlan, events.onCloseRaisePlan);
    contract.current?.off(PlanEventTypes.onDepositOPSFund, events.onDepositOPSFund);
    contract.current?.off(PlanEventTypes.onStartRaisePlan, events.onStartRaisePlan);
    contract.current?.off(PlanEventTypes.onWithdrawOPSFund, events.onWithdrawOPSFund);
    contract.current?.off(PlanEventTypes.onWithdrawRaiseFund, events.onWithdrawRaiseFund);
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
        withContract(
          withGas(async (maxPriorityFeePerGas, contract, opts?: Options) => {
            return await contract?.payOpsSecurityFund({
              maxPriorityFeePerGas,
              maxFeePerGas: getMaxFeePerGas(maxPriorityFeePerGas),
              // gasLimit: 1000000,
              ...opts,
            });
          }),
        ),
      ),
    ),
  );

  /**
   * 指定保证金缴纳地址
   */
  const specifyOpsPayer = toastify(
    withConnect(
      withTx(
        withContract(
          withGas(async (maxPriorityFeePerGas, contract, address: string, opts?: Options) => {
            return await contract?.specifyOpsPayer(address, {
              maxPriorityFeePerGas,
              maxFeePerGas: getMaxFeePerGas(maxPriorityFeePerGas),
              // gasLimit: 1000000,
              ...opts,
            });
          }),
        ),
      ),
    ),
  );

  /**
   * 启动募集计划
   */
  const startRaisePlan = toastify(
    withConnect(
      withTx(
        withContract(
          withGas(async (maxPriorityFeePerGas, contract, opts?: Options) => {
            return await contract?.startRaisePlan({
              maxPriorityFeePerGas,
              maxFeePerGas: getMaxFeePerGas(maxPriorityFeePerGas),
              // gasLimit: 1000000,
              ...opts,
            });
          }),
        ),
      ),
    ),
  );

  /**
   * 关闭募集计划
   */
  const closeRaisePlan = toastify(
    withConnect(
      withTx(
        withContract(
          withGas(async (maxPriorityFeePerGas, contract, opts?: Options) => {
            return await contract?.closeRaisePlan({
              maxPriorityFeePerGas,
              maxFeePerGas: getMaxFeePerGas(maxPriorityFeePerGas),
              // gasLimit: 1000000,
              ...opts,
            });
          }),
        ),
      ),
    ),
  );

  /**
   * 获取已募集金额
   */
  const pledgeTotalAmount = withContract(async (contract) => {
    return await contract?.pledgeTotalAmount();
  });

  /**
   * 获取募集金额
   */
  const pledgeAmount = withContract(async (contract, address: string) => {
    return await contract?.pledgeRecord(address);
  });

  /**
   * 提取募集保证金
   */
  const withdrawRaiseFund = toastify(
    withConnect(
      withTx(
        withContract(
          withGas(async (maxPriorityFeePerGas, contract, opts?: Options) => {
            return await contract?.withdrawRaiseSecurityFund({
              maxPriorityFeePerGas,
              maxFeePerGas: getMaxFeePerGas(maxPriorityFeePerGas),
              // gasLimit: 1000000,
              ...opts,
            });
          }),
        ),
      ),
    ),
  );

  /**
   * 提取运维保证金
   */
  const withdrawOPSFund = toastify(
    withConnect(
      withTx(
        withContract(
          withGas(async (maxPriorityFeePerGas, contract, opts?: Options) => {
            return await contract?.withdrawOPSSecurityFund({
              maxPriorityFeePerGas,
              maxFeePerGas: getMaxFeePerGas(maxPriorityFeePerGas),
              // gasLimit: 1000000,
              ...opts,
            });
          }),
        ),
      ),
    ),
  );

  /**
   * 质押
   */
  const staking = toastify(
    withConnect(
      withTx(
        withContract(
          withGas(async (maxPriorityFeePerGas, contract, opts?: Options) => {
            return await contract?.staking({
              maxPriorityFeePerGas,
              maxFeePerGas: getMaxFeePerGas(maxPriorityFeePerGas),
              // gasLimit: 1000000,
              ...opts,
            });
          }),
        ),
      ),
    ),
  );

  /**
   * 赎回
   */
  const unStaking = toastify(
    withConnect(
      withTx(
        withContract(
          withGas(async (maxPriorityFeePerGas, contract, amount: BigNumber, opts?: Options) => {
            return await contract?.unStaking(amount, address, {
              maxPriorityFeePerGas,
              maxFeePerGas: getMaxFeePerGas(maxPriorityFeePerGas),
              // gasLimit: 1000000,
              ...opts,
            });
          }),
        ),
      ),
    ),
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
   * 获取总收益
   */
  const totalRewardOf = withConnect(
    withContract(async (contract, address: string) => {
      return await contract?.totalRewardOf(address);
    }),
  );

  /**
   * 获取可提取收益
   */
  const availableRewardOf = withConnect(
    withContract(async (contract, address: string) => {
      return await contract?.availableRewardOf(address);
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
    getNodeState,
    getRaiseState,
    specifyOpsPayer,
    startRaisePlan,
    withdrawOPSFund,
    withdrawRaiseFund,
    pledgeAmount,
    pledgeTotalAmount,
    totalRewardOf,
    availableRewardOf,
  };
}
