import { useState } from 'react';

import { sleep } from '@/utils/utils';
import { catchify } from '@/utils/hackify';

export type Result<R = any, P extends unknown[] = any> = [boolean, (...args: P) => Promise<R>];

export type Options = {
  loadingDelay?: number;
};

export default function useLoadingify<R = any, P extends unknown[] = any>(handler: (...args: P) => Promise<R>, options?: Options): Result<R, P> {
  const [loading, setLoading] = useState(false);

  const run = async (...args: P) => {
    setLoading(true);

    const [e, res] = await catchify(handler)(...args);

    if (options?.loadingDelay) {
      await sleep(options.loadingDelay);
    }

    if (e) {
      throw e;
    }

    return res;
  };

  return [loading, run];
}
