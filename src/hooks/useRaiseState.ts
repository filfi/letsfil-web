import { useEffect, useMemo, useState } from 'react';

import { isEqual } from '@/utils/utils';
import useAccounts from './useAccounts';
import useLoadingify from './useLoadingify';
import useRaiseContract from './useRaiseContract';
import { NodeState, RaiseState } from '@/constants/state';

export default function useRaiseState(data?: API.Plan) {
  const { account } = useAccounts();
  const contract = useRaiseContract(data?.raise_address);

  const [hasOwner, setHasOwner] = useState(false);
  const [raiseState, setRaiseState] = useState(data?.status ?? -1);
  const [nodeState, setNodeState] = useState(data?.sealed_status ?? -1);

  // 等待上链
  const isPending = useMemo(() => raiseState === 10, [raiseState]);
  // 已开始
  const isStarted = useMemo(() => raiseState > RaiseState.WaitingStart && !isPending, [raiseState, isPending]);
  // 处理中（封装和运行）
  const isProcess = useMemo(() => raiseState >= RaiseState.Success && !isPending, [raiseState, isPending]);
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
  // 等待封装
  const isWaitSeal = useMemo(() => isSuccess && nodeState === NodeState.WaitingStart, [isSuccess, nodeState]);
  // 封装中
  const isSealing = useMemo(() => isSuccess && nodeState === NodeState.Started, [isSuccess, nodeState]);
  // 已延期
  const isDelayed = useMemo(() => isSuccess && nodeState === NodeState.Delayed, [isSuccess, nodeState]);
  // 封装完成
  const isFinished = useMemo(() => isSuccess && nodeState === NodeState.End, [isSuccess, nodeState]);
  // 工作中（产生收益）
  const isWorking = useMemo(() => isSuccess && nodeState >= NodeState.End, [isSuccess, nodeState]);
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

    const hasOwner = await contract.getOwner();
    const nodeState = await contract.getNodeState(data.raising_id);
    const raiseState = await contract.getRaiseState(data.raising_id);

    console.log('[raise id]', data.raising_id);
    console.log('[address]: api -> %s, contract -> %s', data.raise_address, contract);
    console.log('[raise state] api -> %o, contract -> %o', data.status, raiseState);
    console.log('[node state]: api -> %o, contract -> %o', data.sealed_status, nodeState);

    setHasOwner(hasOwner);
    setRaiseState(raiseState ?? data.status);
    setNodeState(nodeState ?? data.sealed_status);
  });

  useEffect(() => {
    fetchContract();
  }, [account, data]);

  return {
    contract,
    nodeState,
    raiseState,
    payer,
    raiser,
    servicer,
    hasOwner,
    isPayer,
    isRaiser,
    isServicer,
    isClosed,
    isFailed,
    isWaiting,
    isStarted,
    isSuccess,
    isProcess,
    isPending,
    isRaising,
    isWaitSeal,
    isSealing,
    isWorking,
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
