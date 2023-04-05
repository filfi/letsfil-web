import { useState } from 'react';

export default function useLoadingify<R = any, P extends unknown[] = any>(
  handle: (...args: P) => Promise<R>,
) {
  const [loading, setLoading] = useState(false);

  const run = async (...args: P) => {
    setLoading(true);

    try {
      return await handle(...args);
    } finally {
      setLoading(false);
    }
  };

  return { loading, run };
}
