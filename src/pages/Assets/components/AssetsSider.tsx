import { Link, useParams } from '@umijs/max';

import * as F from '@/utils/format';
import * as M from '@/helpers/mount';
import * as R from '@/helpers/raise';
import { SCAN_URL } from '@/constants';
import RewardChart from './RewardChart';
import Avatar from '@/components/Avatar';
import useSProvider from '@/hooks/useSProvider';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import { ReactComponent as IconStar } from '../imgs/icon-star.svg';

const AssetsSider: React.FC<{ pack?: API.Pack | null; plan?: API.Plan | null }> = ({ pack, plan }) => {
  const param = useParams();

  const provider = useSProvider(plan?.service_id);

  const { remainsDays } = useRaiseSeals(plan, pack);

  const renderStatus = () => {
    if (!plan) return null;

    if (R.isClosed(plan)) {
      return <span className="badge">已关闭</span>;
    }

    if (M.isMountPlan(plan) ? M.isStarted(plan) : R.isStarted(plan)) {
      return <span>{F.formatUnixDate(plan?.begin_time)}启动</span>;
    }

    if (R.isFailed(plan)) {
      return <span className="badge badge-danger">质押失败</span>;
    }

    return null;
  };

  return (
    <>
      <RewardChart />

      <div className="card mb-3">
        <div className="card-body d-flex align-items-center gap-3">
          <div className="flex-shrink-0">
            <Avatar src={provider?.logo_url} size={40} />
          </div>

          <div className="flex-grow-1">
            <p className="mb-0 fw-500">{provider?.full_name}</p>
          </div>

          <div className="flex-shrink-0">
            <span className="text-gray-dark">提供技术服务</span>
          </div>
        </div>
      </div>

      <Link className="card mb-3 text-reset" to={`/overview/${param.id}`}>
        <div className="card-body d-flex align-items-center gap-3">
          <div className="flex-shrink-0">
            <IconStar />
          </div>

          <div className="flex-grow-1">
            {M.isMountPlan(plan) ? (
              <p className="mb-1 fw-500">{F.formatSponsor(plan?.sponsor_company)}挂载的分配计划</p>
            ) : (
              <p className="mb-1 fw-500">{F.formatSponsor(plan?.sponsor_company)}发起的节点计划</p>
            )}

            <p className="mb-0 text-gray-dark">{renderStatus()}</p>
          </div>

          <div className="flex-shrink-0">
            <span className="bi bi-arrow-right fs-lg text-gray-dark"></span>
          </div>
        </div>
      </Link>

      <div className="accordion ffi-accordion mb-3">
        <div className="accordion-item">
          <h4 className="accordion-header">
            <button
              className="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#sector-period"
              aria-expanded="true"
              aria-controls="sector-period"
            >
              <span className="bi bi-clock text-gray-dark"></span>
              <span className="ms-2 fs-16 fw-600">扇区期限</span>
            </button>
          </h4>
          <div id="sector-period" className="accordion-collapse collapse show" aria-labelledby="Sector Period">
            <div className="accordion-body py-2">
              <p className="d-flex gap-3 my-3">
                <span className="text-gray-dark">最早到期</span>
                <span className="ms-auto fw-500">{F.formatUnixDate(pack?.min_expiration_epoch, 'll')}</span>
              </p>
              <p className="d-flex gap-3 my-3">
                <span className="text-gray-dark">最晚到期</span>
                <span className="ms-auto fw-500">{F.formatUnixDate(pack?.max_expiration_epoch, 'll')}</span>
              </p>
              <p className="d-flex gap-3 my-3">
                <span className="text-gray-dark">剩余时间</span>
                <span className="ms-auto fw-500">{pack ? <span>{remainsDays} 天</span> : '-'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="accordion ffi-accordion mb-3">
        <div className="accordion-item">
          <h4 className="accordion-header">
            <button
              className="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#miner-info"
              aria-expanded="true"
              aria-controls="miner-info"
            >
              <span className="bi bi-info-square text-gray-dark"></span>
              <span className="ms-2 fs-16 fw-600">详情</span>
            </button>
          </h4>
          <div id="miner-info" className="accordion-collapse collapse show" aria-labelledby="Miner Info">
            <div className="accordion-body py-2">
              <p className="d-flex gap-3 my-3">
                <span className="text-gray-dark">所属节点</span>
                {pack ? (
                  <a className="ms-auto fw-500 text-underline" href={`${SCAN_URL}/address/${pack.miner_id}`} target="_blank" rel="noreferrer">
                    {pack.miner_id}
                  </a>
                ) : (
                  <span className="ms-auto fw-500">-</span>
                )}
              </p>
              <p className="d-flex gap-3 my-3">
                <span className="text-gray-dark">扇区大小</span>
                <span className="ms-auto fw-500">{pack ? <span className="badge badge-success">{F.formatByte(pack?.sector_size)}</span> : '-'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssetsSider;
