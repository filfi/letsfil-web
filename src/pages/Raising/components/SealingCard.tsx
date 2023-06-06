import { Avatar } from 'antd';
import { useMemo } from 'react';
import { Link } from '@umijs/max';

import useAssetPack from '@/hooks/useAssetPack';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import { formatEther, formatRate, formatSponsor } from '@/utils/format';

export type SealingCardProps = {
  data: API.Plan;
  getProvider?: (id?: number | string) => API.Provider | undefined;
};

const SealingCard: React.FC<SealingCardProps> = ({ data, getProvider }) => {
  const { pack } = useAssetPack(data);
  const { progress, running } = useRaiseSeals(data, pack);
  const provider = useMemo(() => getProvider?.(data.service_id), [data.service_id, getProvider]);

  return (
    <>
      <div className="card h-100">
        <Link className="card-header d-flex gap-3 align-items-center stretched-link" to={`/overview/${data.raising_id}`}>
          <div className="flex-shrink-0">
            <Avatar src={data.sponsor_logo} size={{ xs: 48, xl: 56 }} />
          </div>
          <div className="flex-grow-1">
            <h4 className="card-title text-reset mb-0">{formatSponsor(data.sponsor_company)}发起的节点计划</h4>
          </div>
        </Link>
        <div className="card-body py-2">
          <p className="my-3 d-flex gap-3">
            <span className="text-gray-dark">集合质押</span>
            <span className="ms-auto">{formatEther(data.actual_amount)} FIL</span>
          </p>
          <p className="my-3 d-flex gap-3">
            <span className="text-gray-dark">封装进度</span>
            {data.begin_seal_time > 0 ? (
              <span className="ms-auto">
                第{running}天 · {formatRate(progress)}
              </span>
            ) : (
              <span className="ms-auto text-gray">准备封装</span>
            )}
          </p>
          <p className="my-3 d-flex gap-3">
            <span className="text-gray-dark">技术服务</span>
            <span className="ms-auto">
              <span className="d-inline-block">
                <Avatar src={provider?.logo_url} size={20} />
              </span>
              <span className="align-middle">
                <span className="mx-1">{provider?.short_name}</span>
                <span className="mx-1">·</span>
                <span className="mx-1">保证金</span>
                <span>{data.ops_security_fund_rate}%</span>
              </span>
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default SealingCard;
