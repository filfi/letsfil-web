import { useModel } from '@umijs/max';
import { useState } from 'react';

export default function useLoadingify<R = any, P extends unknown[] = any>(handle: (...args: P) => Promise<R>) {
  const [loading, setLoading] = useState(false);
  const { setInitialState } = useModel('@@initialState');

  const run = async (...args: P) => {
    setLoading(true);
    setInitialState((d: any) => ({ ...d, processing: true }));

    try {
      return await handle(...args);
    } finally {
      setLoading(false);
      setInitialState((d: any) => ({ ...d, processing: false }));
    }
  };

  return { loading, run };
}
