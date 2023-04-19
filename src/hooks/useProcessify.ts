import { useModel } from '@umijs/max';
import useLoadingify from './useLoadingify';
import type { Result } from './useLoadingify';

export default function useProcessify<R = any, P extends unknown[] = any>(handle: (...args: P) => Promise<R>): Result<R, P> {
  const { setInitialState } = useModel('@@initialState');

  const result = useLoadingify<R, P>(async (...args: P) => {
    setInitialState((d: any) => ({ ...d, processing: true }));

    try {
      return await handle(...args);
    } finally {
      setInitialState((d: any) => ({ ...d, processing: false }));
    }
  });

  return result;
}
