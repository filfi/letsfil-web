import { useEffect, useState } from 'react';

import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';

export default function useDepositRaise(data?: API.Plan) {
  const { getContract } = useRaiseContract();

  const [amount, setAmount] = useState(0);

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data) return;

    const contract = getContract(data.raise_address);

    const raise = await contract?.securityFundRemain(data.raising_id);

    setAmount(toNumber(raise));
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
    amount,
    loading,
    processing,
    withdraw,
    refresh: fetchData,
  };
}
