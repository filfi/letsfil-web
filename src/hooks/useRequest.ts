import { useState } from 'react';
import { useMount, useUpdateEffect } from 'ahooks';

export type IService<R = any, P extends unknown[] = any> = (...args: P) => Promise<R>;

export type IOptions = {
  manual?: boolean;
  refreshDeps?: any[];
};

export default function useRequest<R = any, P extends unknown[] = any>(service: IService<R, P>, options?: IOptions) {
  const opts = Object.assign({}, options);
  const [data, setData] = useState<R>();
  const [params, setParams] = useState<P>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(false);

  const request = async (...args: P) => {
    setParams(args);
    setLoading(true);
    setError(undefined);

    try {
      let data: any = await service(...args);

      if (`${data.code}` === '0') {
        data = data.data;
      }

      setData(data);
    } catch (e: any) {
      setError(e);
    }

    setLoading(false);
  };

  const run = (...args: P) => {
    return request(...args);
  };

  const refresh = () => {
    const p = params ?? ([] as unknown as P);
    return run(...p);
  };

  useMount(() => {
    if (!opts.manual) {
      const p = params ?? ([] as unknown as P);
      run(...p);
    }
  });

  useUpdateEffect(() => {
    refresh();
  }, [...(opts?.refreshDeps ?? [])]);

  return {
    data,
    error,
    params,
    loading,
    run,
    refresh,
  };
}
