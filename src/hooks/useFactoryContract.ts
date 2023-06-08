import { usePublicClient, useWalletClient } from 'wagmi';
import type { Account } from 'viem';

import abi from '@/abis/factory.abi.json';
import { toastify } from '@/utils/hackify';
import { RAISE_ADDRESS } from '@/constants';
import { RevertedError } from '@/core/errors/RevertedError';

// const handlers = {
//   // 节点计划创建
//   onCreateRaise: createDispatcher(EventType.onCreateRaisePlan, ['raiseID', 'raisePool', 'caller', 'raiseInfo', 'nodeInfo', 'extraInfo']),
// };

export default function useFactoryContract() {
  const { data: walletClient } = useWalletClient();
  const { waitForTransactionReceipt } = usePublicClient();

  const waitTransaction = function <P extends unknown[] = any>(service: (...args: P) => Promise<API.Address | undefined>) {
    return async (...args: P) => {
      const hash = await service(...args);

      if (hash) {
        const res = await waitForTransactionReceipt({ hash });

        console.log(res);

        if (res.status === 'reverted') {
          throw new RevertedError('交易失败', res);
        }

        return res;
      }
    };
  };

  const writeContract = async function <P extends unknown[] = any>(
    functionName: string,
    args: P,
    { account, ...opts }: TxOptions & { account?: Account } = {},
  ) {
    if (!walletClient) return;

    return await waitTransaction(walletClient.writeContract)({
      abi,
      args,
      account,
      functionName,
      address: RAISE_ADDRESS,
      ...(opts as any),
    });
  };

  // 创建节点计划
  const createRaisePlan = toastify(async (raise: RaiseInfo, node: NodeInfo, extra: ExtraInfo, opts?: TxOptions) => {
    console.log(raise, node, extra, opts);
    return await writeContract('createRaisePlan', [raise, node, extra], opts);
  });

  return { createRaisePlan };
}
