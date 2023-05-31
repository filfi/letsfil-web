import { useEffect, useState } from 'react';

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
  const [fines, setFines] = useState(0); // 罚息
  const [amount, setAmount] = useState(0); // 当前保证金

  const contract = useRaiseContract(data?.raise_address);

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data) return;

    const amount = await contract.getRaiseFund(data.raising_id);
    const fines = await contract.getTotalInterest(data.raising_id);

    setFines(toNumber(fines));
    setAmount(toNumber(amount));
  });

  const [processing, withdraw] = useProcessify(async () => {
    if (!data) return;

    await contract.withdrawRaiseFund(data.raising_id);
  });

  useEffect(() => {
    fetchData();
  }, [data]);

  useEmittHandler({
    [EventType.onWithdrawRaiseFund]: fetchData,
  });

  return {
    fines,
    amount,
    loading,
    processing,
    withdraw,
    refresh: fetchData,
  };
}
