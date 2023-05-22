import { Avatar } from 'antd';
import { useMemo } from 'react';

import { formatEther } from '@/utils/format';
import { accSub, sec2day } from '@/utils/utils';

export type WorkingCardProps = {
  data: API.Plan;
  getProvider?: (id?: number | string) => API.Provider | undefined;
};

const WorkingCard: React.FC<WorkingCardProps> = ({ data, getProvider }) => {
  const days = useMemo(() => (data.end_seal_time ? sec2day(Math.max(accSub(Date.now() / 1000, data.end_seal_time), 0)) : 0), [data.end_seal_time]);
  const provider = useMemo(() => getProvider?.(data.service_id), [data.service_id, getProvider]);

  return (
    <>
      <div className="card working-card h-100">
        <div className="card-header d-flex gap-3">
          <div>
            <span className="text-gray-dark">累计收益</span>
            <span className="ms-3 fs-24 fw-600">0</span>
            <span className="ms-1 text-gray-dark">FIL</span>
          </div>
          <div className="ms-auto">
            <span className="text-gray-dark">分配给</span>
            <span className="ms-3 fs-24 fw-600">0</span>
            <span className="ms-1">地址</span>
          </div>
        </div>
        <div className="card-body py-2">
          <p className="my-3 d-flex gap-3">
            <span className="text-gray-dark">募集计划</span>
            <span className="ms-auto">
              <span>{data.sponsor_company}发起的募集计划</span>
              <span className="mx-1">·</span>
              <span>已运行{days}天</span>
            </span>
          </p>
          <p className="my-3 d-flex gap-3">
            <span className="text-gray-dark">成功募集</span>
            <span className="ms-auto">{formatEther(data.actual_amount)} FIL</span>
          </p>
        </div>
        <div className="card-footer d-flex gap-3">
          <div>
            <Avatar src={provider?.logo_url} size={24} />
            <span className="ms-2">{provider?.short_name}</span>
            <span className="mx-1">·</span>
            <span className="mx-1">保证金</span>
            <span>{data.ops_security_fund_rate}%</span>
          </div>
          <div className="ms-auto my-auto">
            <span className="badge badge-success">提供技术服务</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkingCard;
