import { useMount } from 'ahooks';
import { getContract } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

import abi from '@/abis/factory.abi.json';
import { RAISE_ADDRESS } from '@/constants';

export enum FactoryEventTypes {
  onCreateRaisePlan = 'CreateRaisePlan',
}

// const handlers = {
//   // 节点计划创建
//   onCreateRaise: createDispatcher(EventType.onCreateRaisePlan, ['raiseID', 'raisePool', 'caller', 'raiseInfo', 'nodeInfo', 'extraInfo']),
// };

export default function useFactoryContract() {
  const publicClient = usePublicClient();
  const walletClient = useWalletClient();

  const contract = getContract({
    abi,
    publicClient,
    address: RAISE_ADDRESS as any,
    walletClient: walletClient.data!,
  });

  // const bindEvents = () => {
  //   contract?.on(FactoryEventTypes.onCreateRaisePlan, handlers.onCreateRaise);
  // };
  // const unbindEvents = () => {
  //   contract?.off(FactoryEventTypes.onCreateRaisePlan, handlers.onCreateRaise);
  // };

  const initContract = () => {
    if (!contract) {
      // createContract();
      // bindEvents();
    }
  };

  useMount(initContract);

  // useUnmount(unbindEvents);

  // 创建节点计划
  const createRaisePlan = async (raise: RaiseInfo, node: NodeInfo, extra: ExtraInfo, opts?: TxOptions) => {
    console.log(raise, node, extra, opts);
    return await contract.write.createRaisePlan([
      raise,
      node,
      extra,
      {
        ...opts,
      },
    ]);
  };

  return { createRaisePlan };
}
