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
import { accSub, isDef, sleep } from '@/utils/utils';

/**
 * 服务商的投资信息
 * @param data
 * @returns
 */
export default function useDepositServicer(data?: API.Plan) {
  const { withConnect } = useAccount();
  const { isServicer } = useRaiseRole(data);
  const contract = useContract(data?.raise_address);

  const [fines, setFines] = useState(0); // 罚金
  const [actual, setActual] = useState(0); // 实际配比部分
  const [interest, setInterest] = useState(0); // 总利息
  const [amount, setAmount] = useState(toNumber(data?.ops_security_fund)); // 当前保证金

  const total = useMemo(() => toNumber(data?.ops_security_fund), [data?.ops_security_fund]); // 总保证金
  const over = useMemo(() => Math.max(accSub(total, actual), 0), [actual, total]); // 超配部分
  const remain = useMemo(() => Math.max(accSub(actual, amount), 0), [actual, amount]); // 剩余部分

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data?.raising_id || !isServicer) return;

    const [amount, actual, fines, interest] = await Promise.all([
      contract.getFundOps(data.raising_id),
      contract.getFundOpsCalc(data.raising_id),
      contract.getServicerFines(data.raising_id),
      contract.getTotalInterest(data.raising_id),
    ]);

    isDef(fines) && setFines(fines);
    isDef(actual) && setActual(actual);
    isDef(amount) && setAmount(amount);
    isDef(interest) && setInterest(interest);
  });

  const [paying, payAction] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.depositOpsFund(data.raising_id, {
        value: parseEther(`${amount}`),
      });

      await sleep(1_000);
      fetchData();

      return res;
    }),
  );

  const [withdrawing, withdrawAction] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.withdrawOpsFund(data.raising_id);

      await sleep(200);
      fetchData();

      return res;
    }),
  );

  useDebounceEffect(
    () => {
      fetchData();
    },
    [data?.raising_id, isServicer],
    { wait: 300, leading: true },
  );

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
    interest,
    loading,
    paying,
    withdrawing,
    payAction,
    withdrawAction,
    refresh: fetchData,
  };
}
