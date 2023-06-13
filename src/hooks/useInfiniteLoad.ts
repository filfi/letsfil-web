import { useEffect, useState } from 'react';
import usePagination from './usePagination';
import type { IOptions, IService } from './usePagination';

export default function useInfiniteLoad<R = any, P extends any[] = any>(service: IService<R, P>, options?: IOptions) {
  const [data, setData] = useState<R[]>();

  const { data: _data, ...other } = usePagination<R, P>(service, options);

  useEffect(() => {
    setData((items) => {
      if (items && _data) {
        return items.concat(_data);
      }

      return _data;
    });
  }, [_data]);

  return {
    ...other,
    data,
  };
}
