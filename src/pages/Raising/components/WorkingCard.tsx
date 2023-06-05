import { Avatar } from 'antd';
import { useMemo } from 'react';
import { Link } from '@umijs/max';
import { useRequest } from 'ahooks';

import { count } from '@/apis/raise';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import useRaiseReward from '@/hooks/useRaiseReward';
import { formatAmount, formatEther } from '@/utils/format';

export type WorkingCardProps = {
  data: API.Plan;
  getProvider?: (id?: number | string) => API.Provider | undefined;
};

const WorkingCard: React.FC<WorkingCardProps> = ({ data, getProvider }) => {
  const { reward } = useRaiseReward(data);
  const { running } = useRaiseSeals(data);

  const provider = useMemo(() => getProvider?.(data.service_id), [data.service_id, getProvider]);
  const { data: counter } = useRequest(() => count(data.raising_id), { refreshDeps: [data.raising_id] });

  return (
    <>
      <div className="card working-card h-100">
        <div className="card-header d-flex gap-3">
          <div>
            <span className="text-gray-dark">累计节点激励</span>
            <span className="ms-3 fs-24 fw-600">{formatAmount(reward)}</span>
            <span className="ms-1 text-gray-dark">FIL</span>
          </div>
          <div className="ms-auto">
            <span className="text-gray-dark">分配给</span>
            <span className="ms-3 fs-24 fw-600">{counter?.investor_count ?? '-'}</span>
            <span className="ms-1">地址</span>
          </div>
        </div>
        <div className="card-body py-2">
          <p className="my-3 d-flex gap-3">
            <span className="text-gray-dark">节点计划</span>
            <span className="ms-auto">
              <Link className="text-underline" to={`/overview/${data.raising_id}`}>
                {data.sponsor_company}发起的节点计划
              </Link>
              <span className="mx-1">·</span>
              <span>已运行{running}天</span>
            </span>
          </p>
          <p className="my-3 d-flex gap-3">
            <span className="text-gray-dark">成功集合质押</span>
            <span className="ms-auto">{formatEther(data.actual_amount)} FIL</span>
          </p>
        </div>
        <div className="card-footer d-flex gap-2">
          <div className="flex-shrink-0">
            <Avatar src={provider?.logo_url} size={32} />
          </div>
          <div className="flex-grow-1 d-flex flex-column flex-md-row gap-2 my-auto">
            <span className="align-middle me-auto">
              <span className="">{provider?.short_name}</span>
              <span className="mx-1">·</span>
              <span className="mx-1">保证金</span>
              <span>{data.ops_security_fund_rate}%</span>
            </span>
            <div>
              <span className="badge badge-success text-sm">提供技术服务</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkingCard;
