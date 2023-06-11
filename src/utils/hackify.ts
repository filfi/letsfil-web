import { BaseError, ContractFunctionRevertedError, UserRejectedRequestError } from 'viem';

import Modal from '@/components/Modal';
import type { AlertOptions } from '@/components/Modal';

export type Service<R = any, P extends unknown[] = any> = (...args: P) => Promise<R>;

export type CatchedResult<R = any, E extends Error = Error> = [E, null] | [null, R];

export function catchify<R = any, P extends unknown[] = any, E extends Error = Error>(service: Service<R, P>) {
  return async (...args: P): Promise<CatchedResult<R, E>> => {
    try {
      const r = await service(...args);

      return [null, r];
    } catch (e) {
      return [e as E, null];
    }
  };
}

export function toastify<R = any, P extends unknown[] = any>(service: Service<R, P>, options?: Omit<AlertOptions, 'content'>) {
  return async (...args: P) => {
    try {
      return await service(...args);
    } catch (e: any) {
      if (e.code === 'ACTION_REJECTED' || e.cause instanceof UserRejectedRequestError) {
        console.log('User rejected request!');
        throw e;
      }

      let msg = e.reason ?? e.data?.errorMessage ?? e.message;

      if (e instanceof BaseError) {
        console.log('BaseError', e.cause);

        msg = e.details || e.shortMessage;

        const revertedError = e.walk((e) => e instanceof ContractFunctionRevertedError) as ContractFunctionRevertedError;

        msg = revertedError?.data?.errorName ?? msg;
      }

      Modal.alert({
        icon: 'error',
        title: '操作失败',
        content: msg,
        ...options,
      });

      throw e;
    }
  };
}

export function withNull<R = any, P extends unknown[] = any>(service: (...args: P) => Promise<R | undefined>) {
  return async (...args: P) => {
    const res = await service(...args);

    return res ?? null;
  };
}
