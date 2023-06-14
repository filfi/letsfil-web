import { Link } from '@umijs/max';
import { useRequest } from 'ahooks';

import { count } from '@/apis/raise';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import useRaiseReward from '@/hooks/useRaiseReward';
import { formatAmount, formatSponsor } from '@/utils/format';

export type WorkingCardProps = {
  data: API.Plan;
};

const WorkingCard: React.FC<WorkingCardProps> = ({ data }) => {
  const { reward } = useRaiseReward(data);
  const { runningDays } = useRaiseSeals(data);

  const { data: counter } = useRequest(() => count(data.raising_id), { refreshDeps: [data.raising_id] });

  return (
    <>
      <div className="card working-card h-100">
        <div className="card-header py-2">
          <p className="py-1 mb-0 d-flex gap-3 align-items-center">
            <span className="text-gray-dark">累计激励</span>
            <span className="ms-auto">
              <span className="fs-24 fw-600">{formatAmount(reward)}</span>
              <span className="ms-1 text-gray-dark fw-bold">FIL</span>
            </span>
          </p>
          <p className="py-1 mb-0 d-flex gap-3 align-items-center">
            <span className="text-gray-dark">分配给</span>
            <span className="ms-auto">
              <span className="fs-24 fw-600">{counter?.investor_count ?? '-'}</span>
              <span className="ms-1 text-gray-dark fw-bold">地址</span>
            </span>
          </p>
        </div>
        <div className="card-body">
          <p className="my-2 d-flex gap-3">
            <span className="flex-grow-1 text-break">
              <Link className="text-underline" to={`/overview/${data.raising_id}`}>
                {formatSponsor(data.sponsor_company)}发起的节点计划@{data.miner_id}
              </Link>
            </span>
            <span className="flex-shrink-0">
              <span className="fw-500">已运行{runningDays}天</span>
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default WorkingCard;
