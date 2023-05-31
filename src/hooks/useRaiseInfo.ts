import { useEffect, useMemo, useState } from 'react';

import useAccounts from './useAccounts';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useEmittHandler from './useEmitHandler';
import { accDiv, isEqual } from '@/utils/utils';
import useRaiseContract from './useRaiseContract';

/**
 * 募集计划信息
 * @param data
 * @returns
 */
export default function useRaiseInfo(data?: API.Plan) {
  const { account } = useAccounts();
  const contract = useRaiseContract(data?.raise_address);

  const [raiser, setRaiser] = useState(data?.raiser ?? ''); // 发起人
  const [servicer, setServicer] = useState(data?.service_provider_address ?? ''); // 服务商

  const [sealed, setSealed] = useState(0); // 已封装金额
  const [hasOwner, setHasOwner] = useState(false); // owner权限
  const [actual, setActual] = useState(toNumber(data?.actual_amount)); // 质押总额
  const [target, setTarget] = useState(toNumber(data?.target_amount)); // 募集目标

  const isRaiser = useMemo(() => isEqual(account, raiser), [account, raiser]);
  const isServicer = useMemo(() => isEqual(account, servicer), [account, servicer]);
  const isSigned = useMemo(() => data?.sp_sign_status === 1, [data?.sp_sign_status]);
  const isOpsPaid = useMemo(() => data?.sp_margin_status === 1, [data?.sp_margin_status]);
  const isRaisePaid = useMemo(() => data?.raise_margin_status === 1, [data?.raise_margin_status]);

  const progress = useMemo(() => (target > 0 ? Math.min(accDiv(actual, target), 1) : 0), [actual, target]); // 募集进度
  const sealProgress = useMemo(() => (actual > 0 ? Math.min(accDiv(sealed, actual), 1) : 0), [actual, sealed]); // 封装进度

  const [loading, fetchData] = useLoadingify(async () => {
    const hasOwner = await contract.getOwner();
    setHasOwner(hasOwner ?? false);

    if (!data) return;

    const node: NodeInfo | undefined = await contract.getNodeInfo(data.raising_id);
    const raise: RaiseInfo | undefined = await contract.getRaiseInfo(data.raising_id);
    const sealed = await contract.getSealedAmount(data.raising_id);
    const actual = await contract.getTotalPledgeAmount(data.raising_id);

    setRaiser(raise?.sponsor ?? data.raiser);
    setServicer(node?.spAddr ?? data.service_provider_address);
    setActual(toNumber(actual));
    setSealed(toNumber(sealed));
    setTarget(toNumber(raise?.targetAmount || data.target_amount));
  });

  useEffect(() => {
    fetchData();
  }, [data]);

  useEmittHandler({
    [EventType.onStaking]: fetchData,
    [EventType.onNodeStateChange]: fetchData,
    [EventType.onRaiseStateChange]: fetchData,
  });

  return {
    actual,
    target,
    sealed,
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
