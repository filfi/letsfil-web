import { parseEther } from 'viem';
import { useMemo, useState } from 'react';
import { useDebounceEffect } from 'ahooks';

import useAccount from './useAccount';
import useContract from './useContract';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useRaiseRole from './useRaiseRole';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import { isDef, sleep } from '@/utils/utils';

/**
 * 主办人的投资信息
 * @param data
 * @returns
 */
export default function useDepositRaiser(data?: API.Plan) {
  const { withConnect } = useAccount();
  const { isRaiser } = useRaiseRole(data);
  const contract = useContract(data?.raise_address);

  const [fines, setFines] = useState(0); // 罚息
  const [amount, setAmount] = useState(toNumber(data?.raise_security_fund)); // 当前保证金

  const total = useMemo(() => toNumber(data?.raise_security_fund), [data?.raise_security_fund]);

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data?.raising_id || !isRaiser) return;

    const [amount, fines] = await Promise.all([contract.getFundRaiser(data.raising_id), contract.getTotalInterest(data.raising_id)]);

    isDef(fines) && setFines(fines);
    isDef(amount) && setAmount(amount);
  });

  const [paying, payAction] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.depositRaiserFund(data.raising_id, {
        value: parseEther(`${toNumber(data.raise_security_fund)}`),
      });

      await sleep(1_000);
      fetchData();

      return res;
    }),
  );

  const [withdrawing, withdrawAction] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.withdrawRaiserFund(data.raising_id);

      await sleep(200);
      fetchData();

      return res;
    }),
  );

  useDebounceEffect(
    () => {
      fetchData();
    },
    [data?.raising_id, isRaiser],
    { wait: 300, leading: true },
  );

  useEmittHandler({
    [EventType.onWithdrawRaiseFund]: fetchData,
  });

  return {
    fines,
    total,
    amount,
    loading,
    paying,
    withdrawing,
    payAction,
    withdrawAction,
    refresh: fetchData,
  };
}
