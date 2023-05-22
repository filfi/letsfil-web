import { useEffect, useMemo, useState } from 'react';

import useAccounts from './useAccounts';
import { isEqual } from '@/utils/utils';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';

export default function useDepositOps(data?: API.Plan) {
  const { account } = useAccounts();
  const { getContract } = useRaiseContract();

  const [amount, setAmount] = useState(0);
  const [opsPayer, setOpsPayer] = useState('');
  const isOpsPayer = useMemo(() => isEqual(account, opsPayer), [account, opsPayer]);

  const [fetching, fetchData] = useLoadingify(async () => {
    if (!data) return;

    const contract = getContract(data.raise_address);

    const info = await contract?.nodeInfo(data.raising_id);
    const ops = await contract?.opsSecurityFundRemain(data.raising_id);

    setAmount(toNumber(ops));
    setOpsPayer(info?.opsSecurityFundPayer ?? '');
  });

  const [loading, withdraw] = useProcessify(async () => {
    if (!data) return;
    const contract = getContract(data.raise_address);

    await contract?.withdrawOpsFund(data.raising_id);
  });

  useEffect(() => {
    fetchData();
  }, [data]);

  useEmittHandler({
    [EventType.onWithdrawOpsFund]: fetchData,
  });

  return {
    amount,
    account,
    opsPayer,
    isOpsPayer,
    fetching,
    loading,
    withdraw,
    refresh: fetchData,
  };
}
