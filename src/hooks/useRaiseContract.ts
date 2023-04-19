import { useRef } from 'react';
import { ethers } from 'ethers';
import { useMount, useUnmount } from 'ahooks';
import MetaMaskOboarding from '@metamask/onboarding';

import { withTx } from '@/helpers/app';
import toastify from '@/utils/toastify';
import useAccounts from './useAccounts';
import abi from '@/abis/factory.abi.json';
import { RAISE_ADDRESS } from '@/constants';
import { createDispatcher, EventType } from '@/utils/mitt';

function createContract() {
  if (MetaMaskOboarding.isMetaMaskInstalled()) {
    const provider = new ethers.providers.Web3Provider(window.ethereum!);

    return new ethers.Contract(RAISE_ADDRESS, abi, provider.getSigner());
  }
}

const events = {
  // 募集计划创建
  onCreateRaise: createDispatcher(EventType.onCreateRaisePlan, ['raisePool', 'caller', 'payValue', 'raiseInfo', 'nodeInfo', 'extraInfo', 'raiseID']),
};

export default function useRaiseContract() {
  const contract = useRef(createContract());

  const { withConnect } = useAccounts();

  const bindEvents = () => {
    console.log(contract.current);
    contract.current?.on('eCreateRaisePlan', events.onCreateRaise);
  };

  useMount(bindEvents);

  useUnmount(() => {
    contract.current?.off('eCreateRaisePlan', events.onCreateRaise);
  });

  const withContract = <R = any, P extends unknown[] = any>(handler: (contract: ethers.Contract | undefined, ...args: P) => Promise<R>) => {
    return async (...args: P) => {
      if (!contract.current) {
        contract.current = createContract();
        bindEvents();
      }

      return await handler(contract.current, ...args);
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
          return await contract?.createRaisePlan(raise, node, extra, {
            ...opts,
          });
        }),
      ),
    ),
  );

  return { createRaisePlan, getRaisePool };
}
