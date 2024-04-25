import { Link } from '@umijs/max';
import classNames from 'classnames';

import { isMountPlan } from '@/helpers/mount';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import useRaiseReward from '@/hooks/useRaiseReward';
import useInvestorCount from '@/hooks/useInvestorCount';
import { formatAmount, formatSponsor } from '@/utils/format';

export type WorkingCardProps = {
  data: API.Plan;
};

const WorkingCard: React.FC<WorkingCardProps> = ({ data }) => {
  const { reward } = useRaiseReward(data);
  const { runningDays } = useRaiseSeals(data);

  const { data: counter } = useInvestorCount(data);

  return (
    <>
      <div className="card h-100">
        <div
          className={classNames('card-header py-2', isMountPlan(data) ? 'bg-success-tertiary' : 'bg-primary-tertiary')}
        >
          <p className="py-1 mb-0 d-flex gap-3 align-items-center">
            <span className="text-gray-dark">累計激勵</span>
            <span className="ms-auto">
              <span className="fw-600">{formatAmount(reward)}</span>
              <span className="ms-1 text-gray-dark">FIL</span>
            </span>
          </p>
          <p className="py-1 mb-0 d-flex gap-3 align-items-center">
            <span className="text-gray-dark">分配給</span>
            <span className="ms-auto">
              <span className="fw-600">{counter?.investor_count ?? '-'}</span>
              <span className="ms-1 text-gray-dark">地址</span>
            </span>
          </p>
        </div>
        <div className="card-body">
          <p className="my-2 d-flex gap-3">
            <span className="flex-grow-1 text-break">
              <Link className="text-underline" to={`/overview/${data.raising_id}`}>
                {isMountPlan(data) ? (
                  <span>
                    {formatSponsor(data.sponsor_company)}掛載的分配計劃@{data.miner_id}
                  </span>
                ) : (
                  <span>
                    {formatSponsor(data.sponsor_company)}發起的節點計劃@{data.miner_id}
                  </span>
                )}
              </Link>
            </span>
            <span className="flex-shrink-0">
              <span className="fw-500">已運行{runningDays}天</span>
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default WorkingCard;
