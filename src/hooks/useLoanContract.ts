import type { BigNumberish } from 'ethers';

import { ADDR_LOAN } from '@/constants';
import { toNumber } from '@/utils/format';
import { toastify } from '@/utils/hackify';
import loanAbi from '@/abis/loan.abi.json';
import useContractTools from './useContractTools';

export type WriteOptions = TxOptions & {
  // account?: Account;
  // address?: API.Address;
};

const toEther = (val?: bigint) => toNumber(val);

/**
 * 借贷合约API
 */
export default function useLoanContract() {
  const db = useContractTools();

  const callStatic = async function <R = any, P extends unknown[] = any>(name: string, args: P) {
    return await db.callStatic<R, P>(ADDR_LOAN, loanAbi, name, args);
  };

  const readContract = async function <R = any, P extends unknown[] = any>(name: string, args: P) {
    return await db.read<R, P>(ADDR_LOAN, loanAbi, name, args);
  };

  const writeContract = async function <P extends unknown[] = any>(name: string, args: P, opts?: WriteOptions) {
    return await db.write<P>(ADDR_LOAN, loanAbi, name, args, opts);
  };

  /**
   * 获取借款年利率
   */
  const getLoanRate = async () => {
    return toEther(await readContract<bigint>('loanRate', []));
  };

  /**
   * 获取借可流动性资产
   */
  const getLiquidity = async () => {
    return toEther(await readContract<bigint>('liquidity', []));
  };

  /**
   * 获取提取数量
   */
  const getClaimable = async (fromId: string, toId: string) => {
    return toEther(await callStatic<bigint>('settleLoan', [fromId, toId]));
  };

  /**
   * 获取可贷数量
   */
  const getMaxLoanable = async () => {
    return toEther(await readContract<bigint>('maxLoanable', []));
  };

  const getFromAssets = async (address: string, id: string) => {
    const items = await readContract<bigint[]>('fromAssets', [address, id]);

    return items.map(toEther);
  };

  const getToAssets = async (address: string, id: string) => {
    const items = await readContract<bigint[]>('toAssets', [address, id]);

    return items.map(toEther);
  };

  /**
   * 存入质押池
   */
  const loanDeposit = toastify(async (opts?: WriteOptions) => {
    return await writeContract('deposit', [], opts);
  });

  /**
   * 质押池取出
   */
  const loanWithdraw = toastify(async (amount: BigNumberish, opts?: WriteOptions) => {
    return await writeContract('withdraw', [amount], opts);
  });

  /**
   * 发起借款
   */
  const postLoan = toastify(async (fromId: string, toId: string, amount: BigNumberish, opts?: WriteOptions) => {
    return await writeContract('loan', [fromId, toId, amount], opts);
  });

  /**
   * 发起结算
   */
  const postSettle = toastify(async (fromId: string, toId: string, opts?: WriteOptions) => {
    return await writeContract('settleLoan', [fromId, toId], opts);
  });

  // /**
  //  * 偿还借款本金
  //  */
  // const repayCapital = toastify(async (fromId: string, toId: string, opts?: WriteOptions) => {
  //   return await writeContract('repayLoan', [fromId, toId], opts);
  // });

  // /**
  //  * 偿还借款利息
  //  */
  // const repayInterest = toastify(async (fromId: string, toId: string, opts?: WriteOptions) => {
  //   return await writeContract('repayInterest', [fromId, toId], opts);
  // });

  /**
   * 偿还本金和利息
   */
  const advanceRepay = toastify(async (fromId: string, toId: string, opts?: WriteOptions) => {
    return await writeContract('advanceRepay', [fromId, toId], opts);
  });

  return {
    getLoanRate,
    getLiquidity,
    getClaimable,
    getMaxLoanable,
    getFromAssets,
    getToAssets,
    loanDeposit,
    loanWithdraw,
    postLoan,
    postSettle,
    advanceRepay,
    // repayInterest,
    // repayCapital,
  };
}
