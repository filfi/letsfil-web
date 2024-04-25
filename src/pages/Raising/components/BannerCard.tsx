import { Link } from '@umijs/max';
import classNames from 'classnames';
import { useCountDown } from 'ahooks';

import Avatar from '@/components/Avatar';
import useRaiseBase from '@/hooks/useRaiseBase';
import useRaiseRate from '@/hooks/useRaiseRate';
import useSProvider from '@/hooks/useSProvider';
import useIncomeRate from '@/hooks/useIncomeRate';
import { formatAmount, formatProgress, formatRate, formatSponsor } from '@/utils/format';

export type BannerCardProps = {
  data: API.Plan;
  className?: string;
  style?: React.CSSProperties;
};

const BannerCard: React.FC<BannerCardProps> = ({ className, data, style }) => {
  const { rate } = useIncomeRate(data);
  const provider = useSProvider(data.service_id);
  const { target, progress } = useRaiseBase(data);
  const { opsRatio, priorityRate } = useRaiseRate(data);
  const [, formatted] = useCountDown({ targetDate: data.closing_time * 1000 });

  return (
    <>
      <div className={classNames('card', className)} style={style}>
        <div className="card-body">
          <div className="float-end mt-lg-5 pt-lg-4">
            <p className="mb-0 fs-30 fw-600">{priorityRate}%</p>
            <p className="mb-0 fs-16 fw-500">建設者獲得</p>
          </div>

          <div className="mb-4">
            <Avatar address={data.raiser} src={data.sponsor_logo} size={56} />
          </div>

          <div className="row g-0 mb-3">
            <div className="col-12 col-lg-10 col-xl-8 col-xxl-6">
              <h3 className="card-title mb-3">
                {formatSponsor(data.sponsor_company)}發起的節點計劃@{data.miner_id}
              </h3>

              <div className="mb-3 fs-16 fw-500">
                <p className="mb-0">質押目標 {formatAmount(target)} FIL</p>
                <p className="mb-1">
                  <span>預估年化 {formatRate(rate)}</span>
                  <span className="mx-1">·</span>
                  <span>質押週期 {data.sector_period}天</span>
                </p>
              </div>

              <div className="mb-3 d-flex gap-3">
                <div className="flex-shrink-0 my-auto">
                  <Avatar address={provider?.wallet_address} size={32} src={provider?.logo_url} />
                </div>
                <div className="flex-grow-1 d-flex flex-column flex-md-row gap-1 my-auto lh-sm">
                  <p className="mb-0">
                    <span>{provider?.full_name}</span>
                  </p>
                  <span className="mx-1 d-none d-lg-inline my-auto">·</span>
                  <p className="mb-0">
                    <span>保證金{opsRatio}%</span>
                    <span className="mx-1">·</span>
                    <span>提供技術服務</span>
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
                      <span className="label">小時</span>
                    </div>
                  </div>
                  <div className="col">
                    <div className="cd-item">
                      <span className="fw-600">{formatted.minutes}</span>
                      <span className="label">分鐘</span>
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
                <span className="fw-600">{formatProgress(progress)}</span>
                <span className="label">達成</span>
              </div>
            </div>

            <Link className="btn btn-lg btn-join stretched-link" to={`/overview/${data.raising_id}`}>
              立刻質押
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default BannerCard;
