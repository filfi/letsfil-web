import { useMemo, useState } from 'react';
import { useDebounceEffect } from 'ahooks';

import useContract from './useContract';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useEmittHandler from './useEmitHandler';
import { accDiv, isDef } from '@/utils/utils';

/**
 * 节点计划信息
 * @param data
 * @returns
 */
export default function useRaiseInfo(data?: API.Plan) {
  const contract = useContract(data?.raise_address);

  const [sealed, setSealed] = useState(0); // 已封装金额
  const [hasOwner, setHasOwner] = useState(false); // owner权限
  const [actual, setActual] = useState(toNumber(data?.actual_amount)); // 质押总额

  const period = useMemo(() => data?.sector_period ?? 0, [data?.sector_period]); // 扇区期限
  const minRate = useMemo(() => accDiv(data?.min_raise_rate ?? 0, 100), [data?.min_raise_rate]); // 最小集合质押比例
  const target = useMemo(() => toNumber(data?.target_amount), [data?.target_amount]); // 质押目标

  const progress = useMemo(() => (target > 0 ? Math.min(accDiv(actual, target), 1) : 0), [actual, target]); // 集合质押进度

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data?.raising_id) return;

    const [hasOwner, actual, sealed] = await Promise.all([
      contract.getOwner(),
      contract.getTotalPledge(data.raising_id),
      contract.getTotalSealed(data.raising_id),
    ]);

    setHasOwner(hasOwner ?? false);
    isDef(actual) && setActual(actual);
    isDef(sealed) && setSealed(sealed);
  });

  useDebounceEffect(
    () => {
      fetchData();
    },
    [data?.raising_id],
    { wait: 300, leading: true },
  );

  useEmittHandler({
    [EventType.onStaking]: fetchData,
    [EventType.onNodeStateChange]: fetchData,
    [EventType.onRaiseStateChange]: fetchData,
  });

  return {
    actual,
    target,
    sealed,
    period,
    minRate,
    progress,
    hasOwner,
    loading,
    refresh: fetchData,
  };
}
