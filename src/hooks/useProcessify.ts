import useLoadingify from './useLoadingify';
import useProcessing from './useProcessing';
import type { Options, Result } from './useLoadingify';

export default function useProcessify<R = any, P extends unknown[] = any>(handler: (...args: P) => Promise<R>, options?: Options): Result<R, P> {
  const [, setProcessing] = useProcessing();

  const result = useLoadingify<R, P>(
    async (...args: P) => {
      setProcessing(true);

      try {
        return await handler(...args);
      } finally {
        setProcessing(false);
      }
    },
    { loadingDelay: 1e3, ...options },
  );

  return result;
}
