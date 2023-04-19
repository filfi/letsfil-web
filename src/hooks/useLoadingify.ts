import { useState } from 'react';

export type Result<R = any, P extends unknown[] = any> = [boolean, (...args: P) => Promise<R>];

export default function useLoadingify<R = any, P extends unknown[] = any>(handle: (...args: P) => Promise<R>): Result<R, P> {
  const [loading, setLoading] = useState(false);

  const run = async (...args: P) => {
    setLoading(true);

    try {
      return await handle(...args);
    } finally {
      setLoading(false);
    }
  };

  return [loading, run];
}
