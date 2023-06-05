import { ethers } from 'ethers';
import { useMount, useUnmount } from 'ahooks';

import useAccount from './useAccount';
import abi from '@/abis/factory.abi.json';
import { toastify } from '@/utils/hackify';
import { RAISE_ADDRESS } from '@/constants';
import { getWeb3Provider, withTx } from '@/helpers/app';
import { createDispatcher, EventType } from '@/utils/mitt';

export enum FactoryEventTypes {
  onCreateRaisePlan = 'CreateRaisePlan',
}

let contract: ethers.Contract | undefined;

function createContract() {
  const provider = getWeb3Provider();

  if (provider) {
    contract = new ethers.Contract(RAISE_ADDRESS, abi, provider.getSigner());
    console.log('[Factory Contract]: ', contract);
    return contract;
  }
}

const handlers = {
  // 节点计划创建
  onCreateRaise: createDispatcher(EventType.onCreateRaisePlan, ['raiseID', 'raisePool', 'caller', 'raiseInfo', 'nodeInfo', 'extraInfo']),
};

export default function useFactoryContract() {
  const { withConnect } = useAccount();

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

  const withContract = <R = any, P extends unknown[] = any>(handler: (contract: ethers.Contract, ...args: P) => Promise<R>) => {
    return async (...args: P) => {
      initContract();

      if (contract) {
        return await handler(contract, ...args);
      }
    };
  };

  // 创建节点计划
  const createRaisePlan = toastify(
    withConnect(
      withTx(
        withContract(async (contract, raise: RaiseInfo, node: NodeInfo, extra: ExtraInfo, opts?: TxOptions) => {
          console.log(raise, node, extra, opts);
          return await contract.createRaisePlan(raise, node, extra);
        }),
      ),
    ),
  );

  return { createRaisePlan };
}
