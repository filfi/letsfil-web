import { useMemo } from 'react';

import Empty from '../Empty';
import Failed from '../Failed';
import Loading from '../Loading';
import { isDef } from '@/utils/utils';

export type LoadingViewProps = {
  data?: any;
  error?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  retry?: () => void;
};

const LoadingView: React.FC<LoadingViewProps> = ({ data, error, loading, children, retry }) => {
  const isEmpty = useMemo(() => isDef(data) && data !== null, [data]);

  if (isEmpty && loading) {
    return (
      <div className="d-flex flex-column justify-content-center vh-75">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex flex-column justify-content-center vh-75">
        <Failed retry={retry} />
      </div>
    );
  }

  if (isEmpty) {
    <div className="d-flex flex-column justify-content-center vh-75">
      <Empty />
    </div>;
  }

  return <>{children}</>;
};

export default LoadingView;
