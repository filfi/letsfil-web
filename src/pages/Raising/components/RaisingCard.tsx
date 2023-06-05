import { Avatar } from 'antd';
import { useMemo } from 'react';
import { Link } from '@umijs/max';
import { useCountDown } from 'ahooks';

import useRaiseInfo from '@/hooks/useRaiseInfo';
import useRaiseRate from '@/hooks/useRaiseRate';
import useIncomeRate from '@/hooks/useIncomeRate';
import { formatEther, formatRate } from '@/utils/format';

export type RaisingCardProps = {
  data: API.Plan;
  getProvider?: (id?: number | string) => API.Provider | undefined;
};

const RaisingCard: React.FC<RaisingCardProps> = ({ data, getProvider }) => {
  const { rate } = useIncomeRate(data);
  const { progress } = useRaiseInfo(data);
  const { opsRatio, priorityRate } = useRaiseRate(data);
  const [, formatted] = useCountDown({ targetDate: data.closing_time * 1000 });

  const provider = useMemo(() => getProvider?.(data.service_id), [data.service_id, getProvider]);

  return (
    <>
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex flex-column flex-lg-row gap-3 mb-3">
            <div className="d-flex flex-grow-1 gap-3 align-items-center">
              <div className="flex-shrink-0">
                <Avatar src={data.sponsor_logo} size={{ xs: 48, lg: 56 }} />
              </div>
              <div className="flex-grow-1">
                <h4 className="card-title mb-0 fw-600">{data.sponsor_company}发起的募集计划</h4>
              </div>
            </div>
            <div className="d-flex flex-shrink-0 flex-column flex-md-row gap-3 mb-auto">
              <div className="row row-cols-4 g-2 me-md-auto">
                <div className="col">
                  <div className="cd-item">
                    <span className="fw-600">{formatted.days}</span>
                    <span className="label">天</span>
                  </div>
                </div>
                <div className="col">
                  <div className="cd-item">
                    <span className="fw-600">{formatted.hours}</span>
                    <span className="label">小时</span>
                  </div>
                </div>
                <div className="col">
                  <div className="cd-item">
                    <span className="fw-600">{formatted.minutes}</span>
                    <span className="label">分钟</span>
                  </div>
                </div>
                <div className="col">
                  <div className="cd-item">
                    <span className="fw-600">{formatted.seconds}</span>
                    <span className="label">秒</span>
                  </div>
                </div>
              </div>
              <Link className="btn btn-primary btn-lg btn-join" to={`/overview/${data.raising_id}`}>
                立刻参加
              </Link>
            </div>
          </div>

          <div className="d-lg-flex gap-3">
            <div className="flex-shrink-0 d-none d-lg-block opacity-0">
              <Avatar src={data.sponsor_logo} size={{ xs: 48, lg: 56 }} />
            </div>
            <div className="flex-grow-1">
              <p className="mb-3 mb-lg-4 fs-16 text-gray-dark">
                <span>募集目标</span>
                <span className="mx-1 fw-bold">{formatEther(data.target_amount)}</span>
                <span>FIL</span>
                <span className="mx-2">·</span>
                <span>已募</span>
                <span className="ms-1 fw-bold">{formatRate(progress)}</span>
              </p>

              <div className="d-flex flex-column flex-md-row flex-md-wrap gap-3">
                <p className="mb-0 fs-16 text-gray-dark">
                  <span className="bi bi-people text-gray"></span>
                  <span className="mx-1">投资人分成比例</span>
                  <span className="fw-bold">{priorityRate}%</span>
                </p>

                <p className="mb-0 fs-16 text-gray-dark">
                  <span className="bi bi-calculator text-gray"></span>
                  <span className="mx-1">预估年化</span>
                  <span className="fw-bold">{formatRate(rate)}</span>
                </p>

                <p className="mb-0 fs-16 text-gray-dark">
                  <span className="bi bi-clock text-gray"></span>
                  <span className="mx-1">承诺封装时间</span>
                  <span className="fw-bold">&lt; {data.seal_days}天</span>
                </p>

                <p className="mb-0 fs-16 text-gray-dark">
                  <span className="d-inline-block text-gray">
                    <Avatar src={provider?.logo_url} size={20} />
                  </span>
                  <span className="align-middle">
                    <span className="mx-1">{provider?.short_name}</span>
                    <span className="mx-1">·</span>
                    <span className="mx-1">保证金配比</span>
                    <span className="fw-bold">{opsRatio}%</span>
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RaisingCard;
