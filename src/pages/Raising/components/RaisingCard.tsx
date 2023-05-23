import { Avatar } from 'antd';
import { useMemo } from 'react';
import { history } from '@umijs/max';
import { useCountDown } from 'ahooks';

import useAccounts from '@/hooks/useAccounts';
import { accDiv, accMul, accSub } from '@/utils/utils';
import useDepositInvest from '@/hooks/useDepositInvest';
import { formatEther, formatPercent, formatRate } from '@/utils/format';

export type RaisingCardProps = {
  data: API.Plan;
  getProvider?: (id?: number | string) => API.Provider | undefined;
};

const RaisingCard: React.FC<RaisingCardProps> = ({ data, getProvider }) => {
  const { withConnect } = useAccounts();
  const { percent } = useDepositInvest(data);
  const [, formatted] = useCountDown({ targetDate: data.closing_time * 1000 });

  const provider = useMemo(() => getProvider?.(data.service_id), [data.service_id, getProvider]);
  // 优先部分
  const priorityRate = useMemo(() => data?.raiser_coin_share ?? 70, [data?.raiser_coin_share]);
  // 保证金占比
  const opsRatio = useMemo(() => data?.ops_security_fund_rate ?? 5, [data?.ops_security_fund_rate]);
  // 投资人部分
  const investRate = useMemo(() => accMul(priorityRate, accDiv(accSub(100, opsRatio), 100)), [priorityRate, opsRatio]);

  const handleJoin = withConnect(async () => {
    history.push(`/overview/${data.raising_id}`);
  });

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
              <button className="btn btn-primary btn-lg btn-join" type="button" onClick={handleJoin}>
                立刻参加
              </button>
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
                <span className="ms-1 fw-bold">{formatRate(percent)}</span>
              </p>

              <div className="d-flex flex-column flex-md-row flex-md-wrap gap-3">
                <p className="mb-0 fs-16 text-gray-dark">
                  <span className="bi bi-people text-gray"></span>
                  <span className="mx-1">投资人分成比例</span>
                  <span className="fw-bold">{investRate}%</span>
                </p>

                <p className="mb-0 fs-16 text-gray-dark">
                  <span className="bi bi-calculator text-gray"></span>
                  <span className="mx-1">预估年化</span>
                  <span className="fw-bold">{formatPercent(data.income_rate || 0)}</span>
                </p>

                <p className="mb-0 fs-16 text-gray-dark">
                  <span className="bi bi-clock text-gray"></span>
                  <span className="mx-1">承诺封装时间</span>
                  <span className="fw-bold">{data.seal_days < 7 ? '< 7' : data.seal_days}天</span>
                </p>

                <p className="mb-0 fs-16 text-gray-dark">
                  <span className="text-gray">
                    <Avatar src={provider?.logo_url} size={24} />
                  </span>
                  <span className="mx-1">{provider?.short_name}</span>
                  <span className="mx-1">·</span>
                  <span className="mx-1">保证金配比</span>
                  <span className="fw-bold">{opsRatio}%</span>
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
