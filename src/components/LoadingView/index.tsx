import { useMemo } from 'react';
import classNames from 'classnames';
import { isPlainObject } from 'lodash';

import Empty from '../Empty';
import Failed from '../Failed';
import Loading from '../Loading';
import { isDef, isStr } from '@/utils/utils';

export type LoadingViewProps = {
  data?: any;
  error?: boolean;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
  emptyTitle?: React.ReactNode;
  errorTitle?: React.ReactNode;
  retry?: () => void;
};

function isEmpty(data: unknown) {
  if (Array.isArray(data) && data.length === 0) return true;

  if (isPlainObject(data) && Object.keys(data as object).length === 0) return true;

  if (isStr(data) && data === '') return true;

  return !isDef(data);
}

const LoadingView: React.FC<LoadingViewProps> = ({ className = 'vh-75', data, error, loading, children, emptyTitle, errorTitle, retry }) => {
  const empty = useMemo(() => isEmpty(data), [data]);

  if ((empty || error) && loading) {
    return <Loading className={className} />;
  }

  if (error) {
    return (
      <div className={classNames('d-flex flex-column justify-content-center', className)}>
        <Failed title={errorTitle} retry={retry} />
      </div>
    );
  }

  if (empty) {
    return (
      <div className={classNames('d-flex flex-column justify-content-center', className)}>
        <Empty title={emptyTitle} />
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingView;
