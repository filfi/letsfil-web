import { useModel } from '@umijs/max';
import useLoadingify from './useLoadingify';
import type { Options, Result } from './useLoadingify';

export default function useProcessify<R = any, P extends unknown[] = any>(handler: (...args: P) => Promise<R>, options?: Options): Result<R, P> {
  const { setInitialState } = useModel('@@initialState');

  const result = useLoadingify<R, P>(
    async (...args: P) => {
      setInitialState((d: any) => ({ ...d, processing: true }));

      try {
        return await handler(...args);
      } finally {
        setInitialState((d: any) => ({ ...d, processing: false }));
      }
    },
    { loadingDelay: 1e3, ...options },
  );

  return result;
}
