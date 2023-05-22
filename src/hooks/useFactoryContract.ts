import { ethers } from 'ethers';
import { useMount, useUnmount } from 'ahooks';
import MetaMaskOboarding from '@metamask/onboarding';

import { withTx } from '@/helpers/app';
import useAccounts from './useAccounts';
import abi from '@/abis/factory.abi.json';
import { toastify } from '@/utils/hackify';
import { RAISE_ADDRESS } from '@/constants';
import { createDispatcher, EventType } from '@/utils/mitt';

export enum FactoryEventTypes {
  onCreateRaisePlan = 'CreateRaisePlan',
}

let contract: ethers.Contract | undefined;

function createContract() {
  if (MetaMaskOboarding.isMetaMaskInstalled()) {
    const provider = new ethers.providers.Web3Provider(window.ethereum!);

    contract = new ethers.Contract(RAISE_ADDRESS, abi, provider.getSigner());
    console.log('[Factory Contract]: ', contract);
    return contract;
  }
}

const handlers = {
  // 募集计划创建
  onCreateRaise: createDispatcher(EventType.onCreateRaisePlan, ['raiseID', 'raisePool', 'caller', 'raiseInfo', 'nodeInfo', 'extraInfo']),
};

export default function useFactoryContract() {
  const { withConnect } = useAccounts();

  const bindEvents = () => {
    contract?.on(FactoryEventTypes.onCreateRaisePlan, handlers.onCreateRaise);
  };
  const unbindEvents = () => {
    contract?.off(FactoryEventTypes.onCreateRaisePlan, handlers.onCreateRaise);
  };

  const initContract = () => {
    if (!contract) {
      createContract();
      bindEvents();
    }
  };

  useMount(initContract);

  useUnmount(unbindEvents);

  const withContract = <R = any, P extends unknown[] = any>(handler: (contract: ethers.Contract | undefined, ...args: P) => Promise<R>) => {
    return async (...args: P) => {
      initContract();

      return await handler(contract, ...args);
    };
  };

  const getRaisePool = toastify(
    withConnect(
      withContract(async (contract, sponsor: string, minerID: number, raiseID: number) => {
        return await contract?.getRaisePool(sponsor, minerID, raiseID);
      }),
    ),
  );

  // 创建募集计划
  const createRaisePlan = toastify(
    withConnect(
      withTx(
        withContract(async (contract, raise: RaiseInfo, node: NodeInfo, extra: ExtraInfo, opts?: TxOptions) => {
          console.log(raise, node, extra, opts);
          return await contract?.createRaisePlan(raise, node, extra);
        }),
      ),
    ),
  );

  return { createRaisePlan, getRaisePool };
}
