import { useState } from 'react';
import { useDebounceEffect } from 'ahooks';

import { isDef } from '@/utils/utils';
import useContract from './useContract';
import useLoadingify from './useLoadingify';

/**
 * 节点计划的节点激励
 * @param data
 * @returns
 */
export default function useRaiseReward(data?: API.Plan) {
  const [fines, setFines] = useState(0);
  const [reward, setReward] = useState(0);

  const contract = useContract(data?.raise_address);

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data?.raising_id) return;

    const [total, fines] = await Promise.all([contract.getTotalReward(data.raising_id), contract.getServicerFines(data.raising_id)]);

    isDef(fines) && setFines(fines);
    isDef(total) && setReward(total);
  });

  useDebounceEffect(
    () => {
      fetchData();
    },
    [data?.raising_id],
    { wait: 300, leading: true },
  );

  return {
    fines,
    reward,
    loading,
    refresh: fetchData,
  };
}
