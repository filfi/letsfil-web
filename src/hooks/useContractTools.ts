import { usePublicClient /* useWalletClient */ } from 'wagmi';
// import type { Account } from 'viem';

import { writeContract, WriteTxOptions } from '@/core/contract/write';
import { getContract } from '@/core/contract/get';
// import { RevertedError } from '@/core/errors/RevertedError';

export type WriteOptions = WriteTxOptions & {
  // account?: Account;
  // address?: API.Address;
};

export default function useContractTools() {
  const publicClient = usePublicClient();
  // const { data: walletClient } = useWalletClient();

  // const waitTransaction = function <P extends unknown[] = any>(service: (...args: P) => Promise<API.Address | string | undefined>) {
  //   return async (...args: P) => {
  //     const hash = (await service(...args)) as API.Address;

  //     if (hash) {
  //       const res = await publicClient.waitForTransactionReceipt({ hash });

  //       console.log(res);

  //       if (res.status === 'reverted') {
  //         throw new RevertedError('交易失败', res);
  //       }

  //       return res;
  //     }
  //   };
  // };

  const read = async function <R = any, P extends unknown[] = any>(
    address: API.Address,
    abi: any,
    functionName: string,
    args: P,
  ) {
    const res = await publicClient.readContract({
      abi,
      address,
      functionName,
      args,
    });

    return res as R;
  };

  const callStatic = async function <R = any, P extends unknown[] = any>(
    address: API.Address,
    abi: any,
    functionName: string,
    args: P,
  ) {
    const contract = await getContract(address, abi);

    if (contract) {
      const res = await contract.callStatic[functionName]?.(...args);

      return res as R;
    }
  };

  // const writeContract = async function <P extends unknown[] = any>(
  //   functionName: string,
  //   args: P,
  //   { account: _account, abi: _abi, address: _address, ...opts }: WriteOptions & { abi?: any } = {},
  // ) {
  //   const abi = _abi ?? raiseAbi;
  //   const addr = _address ?? address;

  //   if (!addr || !walletClient) return;

  //   // publicClient.e

  //   const account = _account ?? walletClient.account;
  //   const gas = await publicClient.estimateContractGas({
  //     abi,
  //     args,
  //     account,
  //     functionName,
  //     address: addr,
  //     ...opts,
  //   });

  //   const params = {
  //     abi,
  //     gas,
  //     args,
  //     account,
  //     functionName,
  //     address: addr,
  //     ...(opts as any),
  //   };

  //   console.log(params);

  //   return await waitTransaction(walletClient.writeContract)(params);
  // };

  const write = async function <P extends unknown[] = any>(
    address: API.Address,
    abi: any,
    functionName: string,
    args: P,
    opts?: WriteOptions,
  ) {
    const params = {
      abi,
      address,
      functionName,
      args,
      ...opts,
    };

    console.log({ ...params });

    return await writeContract(params);
  };

  // const writeContract = async function <P extends unknown[] = any>(
  //   functionName: string,
  //   args: P,
  //   { account: _account, abi: _abi, address: _address, ...opts }: WriteOptions & { abi?: any } = {},
  // ) {
  //   const abi = _abi ?? raiseAbi;
  //   const addr = _address ?? address;

  //   if (!addr || !walletClient) return;

  //   const account = _account ?? walletClient?.account;

  //   const params = {
  //     abi,
  //     args,
  //     account,
  //     functionName,
  //     address: addr,
  //     ...opts,
  //   };

  //   const gas = await publicClient.estimateContractGas(params);

  //   console.log({ ...params, gas });

  //   return await waitTransaction(walletClient.writeContract)({ ...params, gas });
  // };

  return {
    read,
    write,
    callStatic,
  };
}
