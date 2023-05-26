import { useEffect, useState } from 'react';

import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';

export default function useDepositOps(data?: API.Plan) {
  const { getContract } = useRaiseContract();

  const [amount, setAmount] = useState(0);

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data) return;

    const contract = getContract(data.raise_address);

    const ops = await contract?.opsSecurityFundRemain(data.raising_id);

    setAmount(toNumber(ops));
  });

  const [processing, withdraw] = useProcessify(async () => {
    if (!data) return;
    const contract = getContract(data.raise_address);

    await contract?.withdrawOpsSecurityFund(data.raising_id);
  });

  useEffect(() => {
    fetchData();
  }, [data]);

  useEmittHandler({
    [EventType.onWithdrawOpsFund]: fetchData,
  });

  return {
    amount,
    loading,
    processing,
    withdraw,
    refresh: fetchData,
  };
}
