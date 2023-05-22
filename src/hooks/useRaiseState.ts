import { useEffect, useMemo, useState } from 'react';

import useAccounts from './useAccounts';
import { isEqual } from '@/utils/utils';
import useLoadingify from './useLoadingify';
import useRaiseContract from './useRaiseContract';
import { NodeState, RaiseState } from '@/constants/state';

export default function useRaiseState(data?: API.Plan) {
  const { account } = useAccounts();
  const contract = useRaiseContract(data?.raise_address);

  const [nodeState, setNodeState] = useState(10);
  const [raiseState, setRaiseState] = useState(10);

  // 等待上链
  const isPending = useMemo(() => raiseState === 10, [raiseState]);
  // 已开始
  const isStarted = useMemo(() => raiseState > RaiseState.WaitingStart && !isPending, [raiseState, isPending]);
  // 等待开始
  const isWaiting = useMemo(() => raiseState === RaiseState.WaitingStart, [raiseState]);
  // 募集中
  const isRaising = useMemo(() => raiseState === RaiseState.Raising, [raiseState]);
  // 已关闭
  const isClosed = useMemo(() => raiseState === RaiseState.Closed, [raiseState]);
  // 成功
  const isSuccess = useMemo(() => raiseState === RaiseState.Success, [raiseState]);
  // 已失败
  const isFailed = useMemo(() => raiseState === RaiseState.Failure, [raiseState]);
  // 封装中
  const isSealing = useMemo(() => isSuccess && nodeState === NodeState.Started, [isSuccess, nodeState]);
  // 封装完成
  const isFinished = useMemo(() => isSuccess && nodeState === NodeState.End, [isSuccess, nodeState]);
  // 已延期
  const isDelayed = useMemo(() => isSuccess && nodeState === NodeState.Delayed, [isSuccess, nodeState]);
  // 已销毁（节点运行结束）
  const isDestroyed = useMemo(() => isSuccess && nodeState === NodeState.Destroy, [isSuccess, nodeState]);

  const raiser = useMemo(() => data?.raiser, [data?.raiser]);
  const payer = useMemo(() => data?.ops_security_fund_addr, [data?.ops_security_fund_addr]);
  const servicer = useMemo(() => data?.service_provider_address, [data?.service_provider_address]);
  const isPayer = useMemo(() => isEqual(account, payer), [account, payer]);
  const isRaiser = useMemo(() => isEqual(account, raiser), [account, raiser]);
  const isServicer = useMemo(() => isEqual(account, servicer), [account, servicer]);

  const isSigned = useMemo(() => data?.sp_sign_status === 1, [data?.sp_sign_status]);
  const isOpsPaid = useMemo(() => data?.sp_margin_status === 1, [data?.sp_margin_status]);
  const isRaisePaid = useMemo(() => data?.raise_margin_status === 1, [data?.raise_margin_status]);

  const [loading, fetchContract] = useLoadingify(async () => {
    if (!data) return;

    const nodeState = await contract.getNodeState(data.raising_id);
    const raiseState = await contract.getRaiseState(data.raising_id);

    setNodeState(nodeState ?? 10);
    setRaiseState(raiseState ?? 10);
  });

  useEffect(() => {
    fetchContract();
  }, [account, data?.raise_address]);

  return {
    contract,
    nodeState,
    raiseState,
    payer,
    raiser,
    servicer,
    isPayer,
    isRaiser,
    isServicer,
    isClosed,
    isFailed,
    isWaiting,
    isStarted,
    isSuccess,
    isPending,
    isRaising,
    isSealing,
    isDelayed,
    isFinished,
    isDestroyed,
    isSigned,
    isOpsPaid,
    isRaisePaid,
    loading,
    setNodeState,
    setRaiseState,
    refresh: fetchContract,
  };
}
