import { toNumber } from '@/utils/format';
import afilAbi from '@/abis/afil.abi.json';
import useContractTools from './useContractTools';
import retrieverAbi from '@/abis/retriever.abi.json';
import { ADDR_RETRIEVER, ADDR_AFIL } from '@/constants';

const AFIL_FNS = ['balanceOf'];

const toEther = (val: bigint) => toNumber(val);

/**
 * 借贷合约API
 */
export default function useRetrieverContract() {
  const db = useContractTools();

  const readContract = async function <R = any, P extends unknown[] = any>(name: string, args: P) {
    if (AFIL_FNS.includes(name)) {
      return await db.read<R>(ADDR_AFIL, afilAbi, name, args);
    }

    return await db.read<R>(ADDR_RETRIEVER, retrieverAbi, name, args);
  };

  /**
   * 获取质押池FIL总量
   */
  const getFILPool = async () => {
    return toEther(await readContract<bigint>('filPool', []));
  };

  /**
   * 获取质押池AFIL总量
   */
  const getAFILPool = async () => {
    return toEther(await readContract<bigint>('sfilPool', []));
  };

  /**
   * 获取质押池已借出FIL总量
   */
  const getLoanedFIL = async () => {
    return toEther(await readContract<bigint>('filLoaned', []));
  };

  /**
   * 获取借款年利率
   */
  // const getLoanRate = async () => {
  //   return toEther(await readContract<bigint>('loanRate', []));
  // };

  /**
   * 获取账户AFIL余额
   * @param account
   */
  const getAFILBalance = async (account: API.Address) => {
    return toEther(await readContract<bigint>('balanceOf', [account]));
  };

  /**
   * 获取账户在资产包质押数量
   * @param account
   * @param id
   * @returns
   */
  const getUserAsset = async (account: string | API.Address, id: string) => {
    const assets = await readContract<bigint[]>('userAsset', [account, id]);
    return assets.map(toEther);
  };

  /**
   * 获取账户在资产包质押数量
   * @param id
   * @param account
   * @returns
   */
  const getPledgeAmount = async (id: string, account: string | API.Address) => {
    return toEther(await readContract<bigint>('initialPledge', [id, account]));
  };

  /**
   * 获取账户在资产包杠杆质押数量
   * @param id
   * @param account
   * @returns
   */
  const getLereragePledge = async (id: string, account: string | API.Address) => {
    return toEther(await readContract<bigint>('pryPledge', [id, account]));
  };

  /**
   * 获取用户的当前借款数量
   * @param id
   * @param account
   */
  const getLoanedAmount = async (id: string, account: string | API.Address) => {
    return toEther(await readContract<bigint>('currentLoan', [id, account]));
  };

  /**
   * 获取用户的未偿债务
   * @param id
   * @param account
   */
  const getUnpaidLoan = async (id: string, account: string | API.Address) => {
    return toEther(await readContract<bigint>('unpaidDebt', [id, account]));
  };

  /**
   * 获取用户的可抵押资产列表
   * @param account
   * @param ids
   */
  const getPledgeList = async (account: string | API.Address, ids: (number | string)[]) => {
    const list = await readContract<[bigint[], bigint[]]>('pledgeArray', [account, ids]);

    return [list[0].map(toEther), list[1].map(toEther)] as [number[], number[]];
  };

  /**
   * 获取用户的借款列表
   * @param id
   * @param account
   */
  const getLoanedList = async (id: string, account: string | API.Address) => {
    const list = await readContract<[bigint[], bigint[], bigint[]]>('loanArray', [id, account]);

    return [list[0].map(String), list[1].map(toEther), list[2].map(toEther)] as [string[], number[], number[]];
  };

  /**
   * 获取用户杠杆质押对应抵押资产
   * @param id
   * @param account
   */
  const getLeversList = async (id: string, account: string | API.Address) => {
    const list = await readContract<[bigint[], bigint]>('loanToArray', [id, account]);

    return { ids: list[0].map(String), total: toEther(list[1]) };
  };

  /**
   * 获取用户借贷中的债务信息
   * @param account
   * @param from
   * @param to
   */
  const getLoanedDebt = async (account: string | API.Address, from: number | string, to: number | string) => {
    const list = await readContract<bigint[]>('debtInfo', [account, from, to]);

    return list.map(toEther);
  };

  /**
   * 获取用户借贷中的资产信息
   * @param account
   * @param from
   * @param to
   */
  const getLoanedAssets = async (account: string | API.Address, from: number | string, to: number | string) => {
    const list = await readContract<bigint[]>('loanAsset', [account, from, to]);

    return list.map(toEther);
  };

  return {
    getFILPool,
    getAFILPool,
    getLoanedFIL,
    // getLoanRate,
    getUserAsset,
    getAFILBalance,
    getPledgeAmount,
    getLereragePledge,
    getLoanedAmount,
    getUnpaidLoan,
    getPledgeList,
    getLoanedList,
    getLeversList,
    getLoanedDebt,
    getLoanedAssets,
  };
}
