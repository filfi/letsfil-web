import { Avatar } from 'antd';
import { useMemo } from 'react';

import { formatEther, formatRate } from '@/utils/format';
import { accDiv, accMul, accSub, sec2day } from '@/utils/utils';

export type SealingCardProps = {
  data: API.Plan;
  getProvider?: (id?: number | string) => API.Provider | undefined;
};

const SealingCard: React.FC<SealingCardProps> = ({ data, getProvider }) => {
  const period = useMemo(() => data.seal_days, [data.seal_days]);
  const total = useMemo(() => (data.delay_seal_time ? accMul(period, 1.5) : 0), [data.delay_seal_time]);
  const days = useMemo(() => (data.begin_seal_time ? sec2day(Math.max(accSub(Date.now() / 1000, data.begin_seal_time), 0)) : 0), [data.begin_seal_time]);
  const percent = useMemo(() => (total > 0 ? accDiv(days, total) : 0), [days, total]);
  const provider = useMemo(() => getProvider?.(data.service_id), [data.service_id, getProvider]);

  return (
    <>
      <div className="card h-100">
        <div className="card-header d-flex gap-3 align-items-center">
          <div className="flex-shrink-0">
            <Avatar src={data.sponsor_logo} size={{ xs: 48, xl: 56 }} />
          </div>
          <div className="flex-grow-1">
            <h4 className="card-title mb-0">{data.sponsor_company}发起的募集计划</h4>
          </div>
        </div>
        <div className="card-body py-2">
          <p className="my-3 d-flex gap-3">
            <span className="text-gray-dark">成功募集</span>
            <span className="ms-auto">{formatEther(data.actual_amount)} FIL</span>
          </p>
          <p className="my-3 d-flex gap-3">
            <span className="text-gray-dark">封装进度</span>
            <span className="ms-auto">
              第{days}天 · {formatRate(percent)}
            </span>
          </p>
          <p className="my-3 d-flex gap-3">
            <span className="text-gray-dark">技术服务</span>
            <span className="ms-auto">
              <Avatar src={provider?.logo_url} size={20} />
              <span className="mx-1">{provider?.short_name}</span>
              <span className="mx-1">·</span>
              <span className="mx-1">保证金</span>
              <span>{data.ops_security_fund_rate}%</span>
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default SealingCard;
