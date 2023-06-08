import { useMemo, useState } from 'react';
import { useDebounceEffect } from 'ahooks';

import useAccount from './useAccount';
import useContract from './useContract';
import { EventType } from '@/utils/mitt';
import useRaiseRole from './useRaiseRole';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import { accAdd, isDef, sleep } from '@/utils/utils';

/**
 * 主办人节点激励
 * @param data
 * @returns
 */
export default function useRewardRaiser(data?: API.Plan) {
  const { withConnect } = useAccount();
  const { isRaiser } = useRaiseRole(data);
  const contract = useContract(data?.raise_address);

  const [reward, setReward] = useState(0); // 可提取
  const [record, setRecord] = useState(0); // 已提取
  const [pending, setPending] = useState(0); // 待释放

  const total = useMemo(() => accAdd(record, reward, pending), [record, reward, pending]);

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data?.raising_id || !isRaiser) return;

    const [reward, record, pending] = await Promise.all([
      contract.getRaiserAvailableReward(data.raising_id),
      contract.getRaiserWithdrawnReward(data.raising_id),
      contract.getRaiserPendingReward(data.raising_id),
    ]);

    isDef(reward) && setReward(reward);
    isDef(record) && setRecord(record);
    isDef(pending) && setPending(pending);
  });

  const [processing, withdraw] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.raiserWithdraw(data.raising_id);

      await sleep(200);
      fetchData();

      return res;
    }),
  );

  useDebounceEffect(
    () => {
      fetchData();
    },
    [isRaiser, data?.raising_id],
    { wait: 300, leading: true },
  );

  useEmittHandler({
    [EventType.onRaiserWithdraw]: fetchData,
  });

  return {
    total,
    record,
    reward,
    pending,
    loading,
    processing,
    withdraw,
    refresh: fetchData,
  };
}
