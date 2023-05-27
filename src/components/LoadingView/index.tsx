import { useMemo } from 'react';
import { isPlainObject } from 'lodash';

import Empty from '../Empty';
import Failed from '../Failed';
import Loading from '../Loading';
import { isDef, isStr } from '@/utils/utils';

export type LoadingViewProps = {
  data?: any;
  error?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  retry?: () => void;
};

function isEmpty(data: unknown) {
  if (Array.isArray(data) && data.length === 0) return true;

  if (isPlainObject(data) && Object.keys(data as object).length === 0) return true;

  if (isStr(data) && data === '') return true;

  return !isDef(data);
}

const LoadingView: React.FC<LoadingViewProps> = ({ data, error, loading, children, retry }) => {
  const empty = useMemo(() => isEmpty(data), [data]);

  if (empty && loading) {
    return <Loading className="vh-75" />;
  }

  if (error) {
    return (
      <div className="d-flex flex-column justify-content-center vh-75">
        <Failed retry={retry} />
      </div>
    );
  }

  if (empty) {
    return (
      <div className="d-flex flex-column justify-content-center vh-75">
        <Empty />
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingView;
