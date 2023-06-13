import { Link } from '@umijs/max';
import { useRequest } from 'ahooks';

import { count } from '@/apis/raise';
import Avatar from '@/components/Avatar';
import useSProvider from '@/hooks/useSProvider';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import useRaiseReward from '@/hooks/useRaiseReward';
import { formatAmount, formatSponsor } from '@/utils/format';

export type WorkingCardProps = {
  data: API.Plan;
};

const WorkingCard: React.FC<WorkingCardProps> = ({ data }) => {
  const { reward } = useRaiseReward(data);
  const { runningDays } = useRaiseSeals(data);

  const provider = useSProvider(data.service_id);
  const { data: counter } = useRequest(() => count(data.raising_id), { refreshDeps: [data.raising_id] });

  return (
    <>
      <div className="card working-card h-100">
        <div className="card-header">
          <p className="my-3 d-flex gap-3 align-items-center">
            <span className="text-gray-dark">累计激励</span>
            <span className="ms-auto">
              <span className="fs-24 fw-600">{formatAmount(reward)}</span>
              <span className="ms-1 text-gray-dark fw-bold">FIL</span>
            </span>
          </p>
          <p className="my-3 d-flex gap-3 align-items-center">
            <span className="text-gray-dark">分配给</span>
            <span className="ms-auto">
              <span className="fs-24 fw-600">{counter?.investor_count ?? '-'}</span>
              <span className="ms-1 text-gray-dark fw-bold">地址</span>
            </span>
          </p>
        </div>
        <div className="card-body">
          <p className="mt-2 mb-4 d-flex gap-3">
            <Link className="text-underline" to={`/overview/${data.raising_id}`}>
              {formatSponsor(data.sponsor_company)}发起的节点计划
            </Link>
            <span className="ms-auto fw-500">已运行{runningDays}天</span>
          </p>
          <div className="d-flex gap-2 mb-2">
            <div className="flex-shrink-0">
              <Avatar address={provider?.wallet_address} src={provider?.logo_url} size={32} />
            </div>
            <div className="flex-grow-1 my-auto">
              <span className="align-middle me-auto">
                <span className="">{provider?.short_name}</span>
                <span className="mx-1">·</span>
                <span className="">保证金</span>
                <span>{data.ops_security_fund_rate}%</span>
                <span className="mx-1">·</span>
                <span className="">提供技术服务</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkingCard;
