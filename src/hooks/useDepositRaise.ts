import { useEffect, useMemo, useState } from 'react';

import useAccounts from './useAccounts';
import { isEqual } from '@/utils/utils';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';

export default function useDepositRaise(data?: API.Plan) {
  const { account } = useAccounts();
  const { getContract } = useRaiseContract();

  const [amount, setAmount] = useState(0);
  const [raiser, setRaiser] = useState('');
  const isRaiser = useMemo(() => isEqual(account, raiser), [account, raiser]);

  const [fetching, fetchData] = useLoadingify(async () => {
    if (!data) return;

    const contract = getContract(data.raise_address);

    const info = await contract?.raiseInfo(data.raising_id);
    const raise = await contract?.securityFundRemain(data.raising_id);

    setAmount(toNumber(raise));
    setRaiser(info?.sponsor ?? '');
  });

  const [loading, withdraw] = useProcessify(async () => {
    if (!data) return;

    const contract = getContract(data.raise_address);

    await contract?.withdrawRaiseFund(data.raising_id);
  });

  useEffect(() => {
    fetchData();
  }, [data]);

  useEmittHandler({
    [EventType.onWithdrawRaiseFund]: fetchData,
  });

  return {
    amount,
    account,
    raiser,
    isRaiser,
    fetching,
    loading,
    withdraw,
    refresh: fetchData,
  };
}
