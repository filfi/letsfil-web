import { useEffect, useMemo, useState } from 'react';

import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';
import { accSub } from '@/utils/utils';

export default function useDepositOps(data?: API.Plan) {
  const contract = useRaiseContract(data?.raise_address);

  const [fines, setFines] = useState(0); // 罚金
  const [amount, setAmount] = useState(0); // 当前保证金
  const [actual, setActual] = useState(0); // 实际配比部分
  const [totalInterest, setTotalInterest] = useState(0); // 总利息

  const total = useMemo(() => toNumber(data?.ops_security_fund), [data?.ops_security_fund]); // 总保证金
  const over = useMemo(() => Math.max(accSub(total, actual), 0), [actual, total]); // 超配部分
  const remain = useMemo(() => Math.max(accSub(actual, amount), 0), [actual, amount]); // 封装剩余部分

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data) return;

    const fines = await contract.getServicerFines(data.raising_id);
    const amount = await contract.getOpsFund(data.raising_id);
    const actual = await contract.getOpsCalcFund(data.raising_id);
    const totalInterest = await contract.getTotalInterest(data.raising_id);

    setFines(toNumber(fines));
    setActual(toNumber(actual));
    setAmount(toNumber(amount));
    setTotalInterest(toNumber(totalInterest));
  });

  const [processing, withdraw] = useProcessify(async () => {
    if (!data) return;

    await contract?.withdrawOpsFund(data.raising_id);
  });

  useEffect(() => {
    fetchData();
  }, [data]);

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
    processing,
    totalInterest,
    withdraw,
    refresh: fetchData,
  };
}
