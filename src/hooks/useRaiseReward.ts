import { useState } from 'react';
import { useAsyncEffect, useLockFn } from 'ahooks';

import { isDef } from '@/utils/utils';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useRaiseContract from './useRaiseContract';

/**
 * 节点计划的节点激励
 * @param data
 * @returns
 */
export default function useRaiseReward(data?: API.Plan) {
  const [fines, setFines] = useState(0);
  const [reward, setReward] = useState(0);

  const contract = useRaiseContract(data?.raise_address);

  const [loading, fetchData] = useLoadingify(
    useLockFn(async () => {
      if (!data?.raising_id) return;

      const total = await contract.getTotalReward(data.raising_id);
      const fines = await contract.getServicerFines(data.raising_id);

      isDef(fines) && setFines(toNumber(fines));
      isDef(total) && setReward(toNumber(total));
    }),
  );

  useAsyncEffect(fetchData, [data?.raising_id]);

  return {
    fines,
    reward,
    loading,
    refresh: fetchData,
  };
}
