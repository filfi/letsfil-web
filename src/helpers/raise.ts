import type { Address } from 'viem';

import { isEqual, parseMinerID } from '@/utils/utils';
import { blocklist, whitelist } from '@/constants/config';
import { NodeState, RaiseState } from '@/constants/state';

export function isPending<T extends { status: number }>(data: T) {
  return data.status === RaiseState.Pending;
}

export function isWaiting<T extends { status: number }>(data: T) {
  return data.status === RaiseState.WaitingStart;
}

export function isStarted<T extends { status: number }>(data: T) {
  return data.status > RaiseState.WaitingStart && !isPending(data);
}

export function isRaising<T extends { status: number }>(data: T) {
  return data.status === RaiseState.Raising;
}

export function isClosed<T extends { status: number }>(data: T) {
  return data.status === RaiseState.Closed;
}

export function isFailed<T extends { status: number }>(data: T) {
  return data.status === RaiseState.Failure;
}

export function isSuccess<T extends { status: number }>(data: T) {
  return data.status === RaiseState.Success;
}

export function isWaitSeal<T extends { status: number; sealed_status: number }>(data: T) {
  return isSuccess(data) && data.sealed_status === NodeState.WaitingStart;
}

export function isRunning<T extends { status: number; sealed_status: number }>(data: T) {
  return isSuccess(data) && data.sealed_status > NodeState.WaitingStart;
}

export function isSealing<T extends { status: number; sealed_status: number }>(data: T) {
  return isStarted(data) && data.sealed_status === NodeState.Started;
}

export function isDelayed<T extends { status: number; sealed_status: number }>(data: T) {
  return isStarted(data) && data.sealed_status === NodeState.Delayed;
}

export function isFinished<T extends { status: number; sealed_status: number }>(data: T) {
  return isSuccess(data) && data.sealed_status === NodeState.End;
}

export function isDestroyed<T extends { status: number; sealed_status: number }>(data: T) {
  return isSuccess(data) && data.sealed_status === NodeState.Destroy;
}

export function isWorking<T extends { status: number; sealed_status: number }>(data: T) {
  return isSuccess(data) && [NodeState.End, NodeState.Destroy].includes(data.sealed_status);
}

export function isRaiserPaied<T extends { raise_margin_status: number }>(data: T) {
  return data.raise_margin_status === 1;
}

export function isServicerPaied<T extends { sp_margin_status: number }>(data: T) {
  return data.sp_margin_status === 1;
}

export function isRaiserSigned<T extends { status: number; raise_address: string }>(data: T) {
  return data.raise_address && !isPending(data);
}

export function isServicerSigned<T extends { sp_sign_status: number }>(data: T) {
  return data.sp_sign_status === 1;
}

export function isBlock<T extends { miner_id: string }>(data: T) {
  return blocklist.some((i) => isEqual(parseMinerID(i), parseMinerID(data.miner_id)));
}

export function filterRaises(address?: Address | string) {
  return function <T extends { miner_id: string }>(list?: T[]) {
    return list?.filter((i) => {
      if (isBlock(i)) {
        return whitelist.some((n) => isEqual(n.address, address));
      }

      return true;
    });
  };
}
