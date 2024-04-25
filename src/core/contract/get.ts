import { Contract, providers } from 'ethers';
import type { ContractInterface } from 'ethers';

import raiseAbi from '@/abis/raise.abi.json';
import { config } from '@/constants/config';

export async function getContract<A extends string = string>(address: A, abi: ContractInterface = raiseAbi) {
  const connector = config.connector;

  if (connector) {
    const client = await connector.getProvider();
    const chainId = config.getPublicClient().chain.id;
    const provider = new providers.Web3Provider(client, chainId);

    return new Contract(address, abi, provider.getSigner());
  }
}
