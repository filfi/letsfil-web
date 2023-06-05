import { useMemo, useState } from 'react';
import { useAsyncEffect, useLockFn } from 'ahooks';

import useAccount from './useAccount';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useRaiseInfo from './useRaiseInfo';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';
import { accDiv, isDef } from '@/utils/utils';

/**
 * 建设者的投资信息
 * @param data
 * @returns
 */
export default function useDepositInvestor(data?: API.Plan) {
  const { account } = useAccount();
  const { actual } = useRaiseInfo();
  const contract = useRaiseContract(data?.raise_address);

  const [amount, setAmount] = useState(0); // 用户质押金额
  const [record, setRecord] = useState(0); // 用户累计质押金额
  const [withdraw, setWithdraw] = useState(0); // 用户已提取
  const [backAmount, setBackAmount] = useState(0); // 退回金额
  const [backInterest, setBackInterest] = useState(0); // 退回利息

  const isInvestor = useMemo(() => record > 0, [record]);
  const ratio = useMemo(() => (actual > 0 ? accDiv(record, actual) : 0), [record, actual]); // 投资占比

  const [loading, fetchData] = useLoadingify(
    useLockFn(async () => {
      if (!data?.raising_id) return;

      if (account) {
        const info = await contract.getInvestorInfo(data.raising_id, account);
        const back = await contract.getBackAssets(data.raising_id, account);

        const amount = info?.pledgeAmount; // 账户余额
        const record = info?.pledgeCalcAmount; // 账户总质押
        const withdraw = info?.withdrawAmount; // 已提取
        const backAmount = back?.[0]; // 退回金额
        const backInterest = back?.[1]; // 利息补偿

        isDef(account) && setAmount(toNumber(amount));
        isDef(record) && setRecord(toNumber(record));
        isDef(withdraw) && setWithdraw(toNumber(withdraw));
        isDef(backAmount) && setBackAmount(toNumber(backAmount));
        isDef(backInterest) && setBackInterest(toNumber(backInterest));
      }
    }),
  );

  const [processing, unStaking] = useProcessify(async () => {
    if (!data) return;

    await contract.unStaking(data.raising_id);
  });

  useAsyncEffect(fetchData, [account, data?.raising_id]);

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
    processing,
    unStaking,
    refresh: fetchData,
  };
}
