import Modal from '@/components/Modal';
import type { AlertOptions } from '@/components/Modal';

export default function toastify<R = any, P extends unknown[] = any>(
  handler: (...args: P) => Promise<R>,
  options?: Omit<AlertOptions, 'content'>,
) {
  return async (...args: P) => {
    try {
      return await handler(...args);
    } catch (e: any) {
      const content = e.data?.message ?? e.message;

      Modal.alert({
        content,
        icon: 'warn',
        title: '操作失败',
        ...options,
      });

      throw e;
    }
  };
}
