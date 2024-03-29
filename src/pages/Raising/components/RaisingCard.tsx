import { Link } from '@umijs/max';
import { useCountDown } from 'ahooks';

import Avatar from '@/components/Avatar';
import useRaiseBase from '@/hooks/useRaiseBase';
import useRaiseRate from '@/hooks/useRaiseRate';
import useSProvider from '@/hooks/useSProvider';
import useIncomeRate from '@/hooks/useIncomeRate';
import { formatAmount, formatRate, formatSponsor } from '@/utils/format';

export type RaisingCardProps = {
  data: API.Plan;
};

const RaisingCard: React.FC<RaisingCardProps> = ({ data }) => {
  const { rate } = useIncomeRate(data);
  const provider = useSProvider(data.service_id);
  const { minTarget, target } = useRaiseBase(data);
  const { opsRatio, priorityRate } = useRaiseRate(data);
  const [, formatted] = useCountDown({ targetDate: data.closing_time * 1000 });

  return (
    <>
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex flex-column flex-lg-row gap-3 mb-3">
            <div className="d-flex flex-grow-1 gap-3 align-items-center">
              <div className="flex-shrink-0">
                <Avatar address={data.raiser} src={data.sponsor_logo} size={{ md: 48, lg: 56 }} />
              </div>
              <div className="flex-grow-1">
                <h4 className="card-title mb-0 fw-600">{formatSponsor(data.sponsor_company)}发起的节点计划</h4>
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
                立刻质押
              </Link>
            </div>
          </div>

          <div className="d-lg-flex gap-3">
            <div className="flex-shrink-0 d-none d-lg-block opacity-0">
              <Avatar address={data.raiser} src={data.sponsor_logo} size={{ md: 48, lg: 56, xl: 56, xxl: 56 }} />
            </div>
            <div className="flex-grow-1">
              <div className="d-flex flex-column flex-md-row flex-md-wrap gap-2 mb-3 mb-lg-4">
                <p className="mb-0 fs-16 text-gray-dark">
                  <span>质押目标</span>
                  <span className="mx-1 fw-bold">{formatAmount(target)}</span>
                  <span>FIL</span>
                </p>

                <p className="mb-0 fs-16 text-gray-dark d-none d-lg-block">
                  <span className="">·</span>
                </p>

                <p className="mb-0 fs-16 text-gray-dark">
                  <span>最低目标</span>
                  <span className="mx-1 fw-bold">{formatAmount(minTarget)}</span>
                  <span>FIL</span>
                </p>

                <p className="mb-0 fs-16 text-gray-dark d-none d-lg-block">
                  <span className="">·</span>
                </p>

                <p className="mb-0 fs-16 text-gray-dark">
                  <span>质押周期</span>
                  <span className="mx-1 fw-bold">{data.sector_period}</span>
                  <span>天</span>
                </p>
              </div>

              <div className="d-flex flex-column flex-md-row flex-md-wrap gap-2 gap-xl-3 gap-xxl-4">
                <p className="mb-0 fs-16 text-gray-dark">
                  <span className="bi bi-people text-gray"></span>
                  <span className="mx-1">建设者获得</span>
                  <span className="fw-bold">{priorityRate}%</span>
                </p>

                <p className="mb-0 fs-16 text-gray-dark">
                  <span className="bi bi-calculator text-gray"></span>
                  <span className="mx-1">预估年化</span>
                  <span className="fw-bold">{formatRate(rate)}</span>
                </p>

                <p className="mb-0 fs-16 text-gray-dark">
                  <span className="bi bi-clock text-gray"></span>
                  <span className="mx-1">封装时间</span>
                  <span className="fw-bold">&lt; {data.seal_days}天</span>
                </p>

                <p className="mb-0 fs-16 text-gray-dark">
                  <span className="d-inline-block text-gray">
                    <Avatar address={provider?.wallet_address} src={provider?.logo_url} size={20} />
                  </span>
                  <span className="d-inline-flex flex-column flex-sm-row ms-1 align-middle">
                    <span>{provider?.full_name}</span>
                    <span className="d-none d-sm-inline mx-1">·</span>
                    <span>
                      <span>保证金{opsRatio}%</span>
                      <span className="mx-1">·</span>
                      <span>提供技术服务</span>
                    </span>
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
