import { useEffect, useMemo, useState } from 'react';

import useAccounts from './useAccounts';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';
import { accAdd, isEqual } from '@/utils/utils';

export default function useRewardServicer(data?: API.Plan) {
  const { account } = useAccounts();
  const { getContract } = useRaiseContract();

  const [record, setRecord] = useState(0); // 已提取
  const [pending, setPending] = useState(0); // 待释放
  const [available, setavailable] = useState(0); // 可提取
  const [servicer, setServicer] = useState('');

  const isServicer = useMemo(() => isEqual(account, servicer), [account, servicer]);
  const reward = useMemo(() => accAdd(accAdd(record, available), pending), [record, available, pending]);

  const fetchInfo = async () => {
    if (!data) return;

    const contract = getContract(data.raise_address);

    const info = await contract?.getRaiseInfo(data?.raising_id);
    setServicer(info?.spAddress ?? '');
  };

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data) return;

    let record = 0;
    let pending = 0;
    let available = 0;

    const contract = getContract(data.raise_address);

    if (isServicer) {
      record = await contract?.gotSpReward(data.raising_id);
      pending = await contract?.spWillReleaseReward(data.raising_id);
      available = await contract?.spRewardAvailableLeft(data.raising_id);
    }

    setRecord(toNumber(record));
    setPending(toNumber(pending));
    setavailable(toNumber(available));
  });

  useEffect(() => {
    fetchInfo();
  }, [data]);

  useEffect(() => {
    fetchData();
  }, [isServicer]);

  useEmittHandler({
    [EventType.onServicerWithdraw]: fetchData,
  });

  return {
    account,
    record,
    reward,
    pending,
    loading,
    available,
    isServicer,
    refresh: fetchInfo,
  };
}
