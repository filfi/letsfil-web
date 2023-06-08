import { isEqual } from './utils';
import Modal from '@/components/Modal';
import type { AlertOptions } from '@/components/Modal';
import { BaseError, UserRejectedRequestError } from 'viem';

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
      console.log(e.name);

      if (e instanceof BaseError) {
        console.log('BaseError', e.cause);

        if (e.cause instanceof UserRejectedRequestError) {
          console.log('User rejected request!');
          throw e;
        }
      }

      if (!isEqual(e.code, 'ACTION_REJECTED')) {
        const content = e.reason ?? e.data?.message ?? e.message;

        Modal.alert({
          content,
          icon: 'warn',
          title: '操作失败',
          ...options,
        });
      }

      throw e;
    }
  };
}
