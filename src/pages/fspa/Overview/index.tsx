import { Result } from 'antd';
import { useMemo } from 'react';
import { isAddress } from 'viem';
import { Link, useParams } from '@umijs/max';

export default function FSPAOverview() {
  const params = useParams();
  const address = useMemo(() => params.address, [params.address]);

  if (!address || !isAddress(address)) {
    return (
      <Result
        status="404"
        title="未找到服务商"
        subTitle={
          <p className="text-center">
            <Link className="btn btn-primary px-4" replace to="/fspa">
              返回
            </Link>
          </p>
        }
      />
    );
  }

  return <></>;
}
