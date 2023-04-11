import { isEqual } from './utils';
import Modal from '@/components/Modal';
import type { AlertOptions } from '@/components/Modal';

export default function toastify<R = any, P extends unknown[] = any>(service: (...args: P) => Promise<R>, options?: Omit<AlertOptions, 'content'>) {
  return async (...args: P) => {
    try {
      return await service(...args);
    } catch (e: any) {
      if (!isEqual(e.code, 'ACTION_REJECTED')) {
        const content = e.data?.message ?? e.message;

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
