import { Contract, providers } from 'ethers';
import type { BigNumberish, ContractInterface } from 'ethers';

import raiseAbi from '@/abis/raise.abi.json';
import { config } from '@/constants/config';

export type WriteTxOptions = {
  gas?: BigNumberish;
  gasLimit?: BigNumberish;
  gasPrice?: BigNumberish;
  maxFeePerGas?: BigNumberish;
  maxPriorityFeePerGas?: BigNumberish;
  value?: BigNumberish;
};

export type WriteContractOptions<A extends string = string, P extends unknown[] = any> = WriteTxOptions & {
  abi?: ContractInterface;
  args?: P;
  address: A;
  functionName: string;
};

export async function writeContract<A extends string = string, P extends unknown[] = any>({
  address,
  functionName,
  abi = raiseAbi,
  args = [] as unknown as P,
  ...opts
}: WriteContractOptions<A, P>) {
  const connector = config.connector;

  if (connector) {
    const client = await connector.getProvider();
    const chainId = config.getPublicClient().chain.id;
    const provider = new providers.Web3Provider(client, chainId);
    const contract = new Contract(address, abi, provider.getSigner());

    // const gas = await contract.estimateGas[functionName](...args, {
    //   ...opts,
    // });

    // console.log('[gas]: ', gas);

    const tx: providers.TransactionResponse = await contract[functionName](...args, {
      // gasPrice: gas,
      ...opts,
    });

    return await tx.wait();
  }
}
