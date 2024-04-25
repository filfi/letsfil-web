import { providers } from 'ethers';
import type { BigNumberish, ContractInterface } from 'ethers';

import { getContract } from './get';
import raiseAbi from '@/abis/raise.abi.json';

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
  const contract = await getContract(address, abi);

  if (contract) {
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
