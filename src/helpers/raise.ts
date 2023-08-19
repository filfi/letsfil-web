import type { Address } from 'viem';

import { isEqual } from '@/utils/utils';
import { blocklist, whitelist } from '@/constants/config';
import { NodeState, RaiseState } from '@/constants/state';

export function isPending(data: API.Plan) {
  return data.status === RaiseState.Pending;
}

export function isWaiting(data: API.Plan) {
  return data.status === RaiseState.WaitingStart;
}

export function isStarted(data: API.Plan) {
  return data.status > RaiseState.WaitingStart && !isPending(data);
}

export function isRaising(data: API.Plan) {
  return data.status === RaiseState.Raising;
}

export function isClosed(data: API.Plan) {
  return data.status === RaiseState.Closed;
}

export function isFailed(data: API.Plan) {
  return data.status === RaiseState.Failure;
}

export function isSuccess(data: API.Plan) {
  return data.status === RaiseState.Success;
}

export function isWaitSeal(data: API.Plan) {
  return isSuccess(data) && data.sealed_status === NodeState.WaitingStart;
}

export function isRunning(data: API.Plan) {
  return isSuccess(data) && data.sealed_status > NodeState.WaitingStart;
}

export function isSealing(data: API.Plan) {
  return isStarted(data) && data.sealed_status === NodeState.Started;
}

export function isDelayed(data: API.Plan) {
  return isStarted(data) && data.sealed_status === NodeState.Delayed;
}

export function isFinished(data: API.Plan) {
  return isSuccess(data) && data.sealed_status === NodeState.End;
}

export function isDestroyed(data: API.Plan) {
  return isSuccess(data) && data.sealed_status === NodeState.Destroy;
}

export function isWorking(data: API.Plan) {
  return isSuccess(data) && [NodeState.End, NodeState.Destroy].includes(data.sealed_status);
}

export function isRaiserPaied(data: API.Plan) {
  return data.raise_margin_status === 1;
}

export function isServicerPaied(data: API.Plan) {
  return data.sp_margin_status === 1;
}

export function isRaiserSigned(data: API.Plan) {
  return data.raise_address && !isPending(data);
}

export function isServicerSigned(data: API.Plan) {
  return data.sp_sign_status === 1;
}

export function filterRaises(address?: Address | string) {
  return function <T extends { raising_id: string }>(list?: T[]) {
    return list?.filter((i) => {
      if (blocklist.includes(i.raising_id)) {
        return whitelist.some((n) => isEqual(n.address, address));
      }

      return true;
    });
  };
}
