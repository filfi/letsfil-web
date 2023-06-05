import { Avatar } from 'antd';
import { useMemo } from 'react';
import { Link } from '@umijs/max';
import classNames from 'classnames';
import { useCountDown } from 'ahooks';

import { formatRate } from '@/utils/format';
import useRaiseInfo from '@/hooks/useRaiseInfo';
import useRaiseRate from '@/hooks/useRaiseRate';
import useIncomeRate from '@/hooks/useIncomeRate';

export type BannerCardProps = {
  data: API.Plan;
  className?: string;
  getProvider?: (id?: number | string) => API.Provider | undefined;
};

const BannerCard: React.FC<BannerCardProps> = ({ className, data, getProvider }) => {
  const { rate } = useIncomeRate(data);
  const { progress } = useRaiseInfo(data);
  const { opsRatio, priorityRate } = useRaiseRate(data);
  const [, formatted] = useCountDown({ targetDate: data.closing_time * 1000 });

  const provider = useMemo(() => getProvider?.(data.service_id), [data.service_id, getProvider]);

  return (
    <>
      <div className={classNames('card', className)}>
        <div className="card-body">
          <div className="float-end mt-lg-5 pt-lg-3">
            <p className="mb-0 fs-30 fw-600">{priorityRate}%</p>
            <p className="mb-0 fs-16 fw-500">参建者分配比例</p>
          </div>

          <div className="mb-4">
            <Avatar src={data.sponsor_logo} size={56} />
          </div>

          <div className="row g-0 mb-3">
            <div className="col-12 col-lg-10 col-xl-8 col-xxl-6">
              <h3 className="mb-3 fs-30 fw-600">
                {data.sponsor_company}发起的节点计划@{data.miner_id}
              </h3>

              <div className="d-flex flex-md-column justify-content-between gap-2 mb-3">
                <p className="mb-0 fs-16 fw-500">承诺封装时间 {data.seal_days}天</p>
                <p className="mb-0 fs-16 fw-500">预估年化节点激励 {formatRate(rate)}</p>
              </div>

              <div className="mb-3 d-flex gap-3">
                <div className="flex-shrink-0 my-auto">
                  <Avatar size={32} src={provider?.logo_url} />
                </div>
                <div className="flex-grow-1 d-flex flex-column flex-lg-row gap-1 my-auto">
                  <div className="d-flex flex-column flex-md-row gap-1">
                    <p className="mb-0 lh-sm">
                      <span>{provider?.full_name}</span>
                    </p>
                    <p className="mb-0 lh-sm">
                      <span className="mx-1 d-none d-md-inline">·</span>
                      <span>保证金配比 {opsRatio}%</span>
                    </p>
                  </div>
                  <p className="mb-0 lh-1">
                    <span className="mx-1 d-none d-lg-inline">·</span>
                    <span>提供技术服务</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex flex-column flex-md-row gap-4">
            <div className="d-flex gap-2 me-md-auto">
              <div className="flex-grow-1">
                <div className="row row-cols-4 g-2">
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
              </div>
              <div className="cd-item cd-item-fill">
                <span className="fw-600">{formatRate(Math.floor(progress))}</span>
                <span className="label">已募</span>
              </div>
            </div>

            <Link className="btn btn-lg btn-join" to={`/overview/${data.raising_id}`}>
              立刻参加
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default BannerCard;
