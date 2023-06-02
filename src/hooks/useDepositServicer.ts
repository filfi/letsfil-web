import { useMemo, useState } from 'react';
import { useAsyncEffect, useLockFn } from 'ahooks';

import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';
import { accSub, isDef } from '@/utils/utils';

/**
 * 服务商的投资信息
 * @param data
 * @returns
 */
export default function useDepositServicer(data?: API.Plan) {
  const contract = useRaiseContract(data?.raise_address);

  const [fines, setFines] = useState(0); // 罚金
  const [actual, setActual] = useState(0); // 实际配比部分
  const [totalInterest, setTotalInterest] = useState(0); // 总利息
  const [amount, setAmount] = useState(toNumber(data?.ops_security_fund)); // 当前保证金

  const total = useMemo(() => toNumber(data?.ops_security_fund), [data?.ops_security_fund]); // 总保证金
  const over = useMemo(() => Math.max(accSub(total, actual), 0), [actual, total]); // 超配部分
  const remain = useMemo(() => Math.max(accSub(actual, amount), 0), [actual, amount]); // 封装剩余部分

  const [loading, fetchData] = useLoadingify(
    useLockFn(async () => {
      if (!data?.raising_id) return;

      const fines = await contract.getServicerFines(data.raising_id);
      const amount = await contract.getOpsFund(data.raising_id);
      const actual = await contract.getOpsCalcFund(data.raising_id);
      const totalInterest = await contract.getTotalInterest(data.raising_id);

      isDef(fines) && setFines(toNumber(fines));
      isDef(actual) && setActual(toNumber(actual));
      isDef(amount) && setAmount(toNumber(amount));
      isDef(totalInterest) && setTotalInterest(toNumber(totalInterest));
    }),
  );

  const [paying, pay] = useProcessify(async () => {
    if (!data) return;

    return await contract.depositOpsFund(data.raising_id, {
      value: data.ops_security_fund,
    });
  });

  const [processing, withdraw] = useProcessify(async () => {
    if (!data) return;

    return await contract.withdrawOpsFund(data.raising_id);
  });

  useAsyncEffect(fetchData, [data?.raising_id]);

  useEmittHandler({
    [EventType.onWithdrawOpsFund]: fetchData,
  });

  return {
    fines,
    amount,
    over,
    total,
    actual,
    remain,
    loading,
    paying,
    processing,
    totalInterest,
    pay,
    withdraw,
    refresh: fetchData,
  };
}
