import { parseEther } from 'viem';
import { useMemo, useState } from 'react';
import { useDebounceEffect } from 'ahooks';

import useAccount from './useAccount';
import useContract from './useContract';
import { EventType } from '@/utils/mitt';
import useRaiseInfo from './useRaiseInfo';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import { accDiv, isDef, sleep } from '@/utils/utils';

/**
 * 建设者的投资信息
 * @param data
 * @returns
 */
export default function useDepositInvestor(data?: API.Plan) {
  const { actual } = useRaiseInfo(data);
  const { address, withConnect } = useAccount();
  const contract = useContract(data?.raise_address);

  const [amount, setAmount] = useState(0); // 用户质押金额
  const [record, setRecord] = useState(0); // 用户累计质押金额
  const [withdraw, setWithdraw] = useState(0); // 用户已提取
  const [backAmount, setBackAmount] = useState(0); // 退回金额
  const [backInterest, setBackInterest] = useState(0); // 退回利息

  const isInvestor = useMemo(() => record > 0, [record]);
  const ratio = useMemo(() => (actual > 0 ? accDiv(record, actual) : 0), [record, actual]); // 投资占比

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data?.raising_id) return;

    if (address) {
      const [back, info] = await Promise.all([contract.getBackAssets(data.raising_id, address), contract.getInvestorInfo(data.raising_id, address)]);

      const backAmount = back?.[0]; // 退回金额
      const backInterest = back?.[1]; // 利息补偿
      const amount = info?.[0]; // 账户余额
      const record = info?.[1]; // 账户总质押
      const withdraw = info?.[3]; // 已提取

      isDef(amount) && setAmount(amount);
      isDef(record) && setRecord(record);
      isDef(withdraw) && setWithdraw(withdraw);
      isDef(backAmount) && setBackAmount(backAmount);
      isDef(backInterest) && setBackInterest(backInterest);
    }
  });

  const [staking, stakeAction] = useProcessify(
    withConnect(async (amount: number | string) => {
      if (!data) return;

      const res = await contract.staking(data.raising_id, {
        value: parseEther(`${+amount}`),
      });

      await sleep(200);
      fetchData();

      return res;
    }),
  );

  const [unstaking, unStakeAction] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.unStaking(data.raising_id);

      await sleep(200);
      fetchData();

      return res;
    }),
  );

  useDebounceEffect(
    () => {
      fetchData();
    },
    [address, data],
    { wait: 300, leading: true },
  );

  useEmittHandler({
    [EventType.onStaking]: fetchData,
    [EventType.onUnstaking]: fetchData,
  });

  return {
    ratio,
    amount,
    record,
    withdraw,
    backAmount,
    backInterest,
    isInvestor,
    loading,
    staking,
    unstaking,
    stakeAction,
    unStakeAction,
    refresh: fetchData,
  };
}
