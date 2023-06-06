import { useMemo, useState } from 'react';
import { useAsyncEffect, useLockFn } from 'ahooks';

import useAccount from './useAccount';
import usePackData from './usePackData';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';
import { accDiv, isDef, isEqual } from '@/utils/utils';

/**
 * 节点计划信息
 * @param data
 * @returns
 */
export default function useRaiseInfo(data?: API.Plan) {
  const { address } = useAccount();
  const contract = useRaiseContract(data?.raise_address);

  const [sealed, setSealed] = useState(0); // 已封装金额
  const [hasOwner, setHasOwner] = useState(false); // owner权限
  const { pledgeTotal: actual } = usePackData(data); // 质押总额
  // const [actual, setActual] = useState(toNumber(data?.actual_amount)); // 质押总额

  const period = useMemo(() => data?.sector_period ?? 0, [data?.sector_period]); // 扇区期限
  const minRate = useMemo(() => accDiv(data?.min_raise_rate ?? 0, 100), [data?.min_raise_rate]); // 最小集合质押比例
  const target = useMemo(() => toNumber(data?.target_amount), [data?.target_amount]); // 质押目标
  const raiser = useMemo(() => data?.raiser ?? '', [data?.raiser]); // 主办人
  const servicer = useMemo(() => data?.service_provider_address ?? '', [data?.service_provider_address]); // 服务商
  const isRaiser = useMemo(() => isEqual(address, raiser), [address, raiser]);
  const isServicer = useMemo(() => isEqual(address, servicer), [address, servicer]);
  const isSigned = useMemo(() => data?.sp_sign_status === 1, [data?.sp_sign_status]);
  const isOpsPaid = useMemo(() => data?.sp_margin_status === 1, [data?.sp_margin_status]);
  const isRaisePaid = useMemo(() => data?.raise_margin_status === 1, [data?.raise_margin_status]);

  const progress = useMemo(() => (target > 0 ? Math.min(accDiv(actual, target), 1) : 0), [actual, target]); // 集合质押进度
  const sealProgress = useMemo(() => (actual > 0 ? Math.min(accDiv(sealed, actual), 1) : 0), [actual, sealed]); // 封装进度

  const [loading, fetchData] = useLoadingify(
    useLockFn(async () => {
      const hasOwner = await contract.getOwner();
      setHasOwner(hasOwner ?? false);

      if (!data?.raising_id) return;

      const sealed = await contract.getSealedAmount(data.raising_id);
      // const actual = await contract.getTotalPledgeAmount(data.raising_id);

      // isDef(actual) && setActual(toNumber(actual));
      isDef(sealed) && setSealed(toNumber(sealed));
    }),
  );

  useAsyncEffect(fetchData, [data?.raising_id]);

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
    raiser,
    servicer,
    hasOwner,
    isRaiser,
    isServicer,
    isSigned,
    isOpsPaid,
    isRaisePaid,
    loading,
    sealProgress,
    refresh: fetchData,
  };
}
