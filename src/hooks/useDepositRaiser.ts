import { useMemo, useState } from 'react';
import { useAsyncEffect, useLockFn } from 'ahooks';

import { isDef } from '@/utils/utils';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';

/**
 * 发起人的投资信息
 * @param data
 * @returns
 */
export default function useDepositRaiser(data?: API.Plan) {
  const contract = useRaiseContract(data?.raise_address);

  const [fines, setFines] = useState(0); // 罚息
  const [amount, setAmount] = useState(toNumber(data?.raise_security_fund)); // 当前保证金

  const total = useMemo(() => toNumber(data?.raise_security_fund), [data?.raise_security_fund]);

  const [loading, fetchData] = useLoadingify(
    useLockFn(async () => {
      if (!data) return;

      const amount = await contract.getRaiseFund(data.raising_id);
      const fines = await contract.getTotalInterest(data.raising_id);

      isDef(fines) && setFines(toNumber(fines));
      isDef(amount) && setAmount(toNumber(amount));
    }),
  );

  const [paying, pay] = useProcessify(async () => {
    if (!data) return;

    return await contract.depositRaiseFund(data.raising_id, {
      value: data.raise_security_fund,
    });
  });

  const [processing, withdraw] = useProcessify(async () => {
    if (!data) return;

    return await contract.withdrawRaiseFund(data.raising_id);
  });

  useAsyncEffect(fetchData, [data]);

  useEmittHandler({
    [EventType.onWithdrawRaiseFund]: fetchData,
  });

  return {
    fines,
    total,
    amount,
    loading,
    paying,
    processing,
    pay,
    withdraw,
    refresh: fetchData,
  };
}
