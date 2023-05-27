import { useEffect, useState } from 'react';

import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';

export default function useDepositOps(data?: API.Plan) {
  const { getContract } = useRaiseContract();

  const [fines, setFines] = useState(0);
  const [amount, setAmount] = useState(0);
  const [sealed, setSealed] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data) return;

    const contract = getContract(data.raise_address);

    if (!contract) return;

    const fines = await contract.spFine(data.raising_id);
    const sealed = await contract.sealedAmount(data.raising_id);
    const amount = await contract.opsSecurityFundRemain(data.raising_id);
    const totalInterest = await contract.totalInterest(data.raising_id);

    setFines(toNumber(fines));
    setSealed(toNumber(sealed));
    setAmount(toNumber(amount));
    setTotalInterest(toNumber(totalInterest));
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
    fines,
    amount,
    sealed,
    loading,
    processing,
    totalInterest,
    withdraw,
    refresh: fetchData,
  };
}
