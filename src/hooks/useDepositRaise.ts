import { useEffect, useState } from 'react';

import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';

export default function useDepositRaise(data?: API.Plan) {
  const { getContract } = useRaiseContract();

  const [fines, setFines] = useState(0); // 罚息
  const [amount, setAmount] = useState(0); // 当前保证金

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data) return;

    const contract = getContract(data.raise_address);

    if (!contract) return;

    const fines = await contract.totalInterest(data.raising_id);
    const amount = await contract.securityFundRemain(data.raising_id);

    setFines(toNumber(fines));
    setAmount(toNumber(amount));
  });

  const [processing, withdraw] = useProcessify(async () => {
    if (!data) return;

    const contract = getContract(data.raise_address);

    await contract?.withdrawSecurityFund(data.raising_id);
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
