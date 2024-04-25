import { useMemo } from 'react';
import { Link } from '@umijs/max';

import * as F from '@/utils/format';
import { catchify } from '@/utils/hackify';
import { isClosed } from '@/helpers/raise';
import Avatar from '@/components/Avatar';
import Dialog from '@/components/Dialog';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import useSProvider from '@/hooks/useSProvider';
import useLoadingify from '@/hooks/useLoadingify';
import useMountState from '@/hooks/useMountState';
import useMountAssets from '@/hooks/useMountAssets';
import useInvestorCount from '@/hooks/useInvestorCount';
import { ReactComponent as IconShare } from '@/assets/icons/share-06.svg';

function withConfirm<R, P extends unknown[]>(data: API.Plan, handler: (...args: P) => Promise<R>) {
  return (...args: P) => {
    const actionHandler = async () => {
      const [e] = await catchify(handler)(...args);

      if (e) {
        Dialog.alert({
          icon: 'error',
          title: '刪除失敗',
          content: e.message,
        });
      }
    };

    const hide = Dialog.confirm({
      icon: 'delete',
      title: '刪除分配計劃',
      summary: '未簽名的分配計劃可以永久刪除。',
      onConfirm: () => {
        hide();

        actionHandler();
      },
    });
  };
}

const MountItem: React.FC<{
  data: API.Plan;
  role?: number;
  onEdit?: () => Promise<any>;
  onDelete?: () => Promise<any>;
}> = ({ data, role, onEdit, onDelete }) => {
  const provider = useSProvider(data.service_id);
  const { data: counter } = useInvestorCount(data);
  const { isInactive, isActive, isWorking, isOver } = useMountState(data);

  const { power, pledge, investor, sponsor, servicer, sponsorPower, investorPower, servicerPower, investorPledge } =
    useMountAssets(data);

  const isSuper = useMemo(() => sponsor && sponsor.role_level === 1, [sponsor]);
  const shareUrl = useMemo(() => `${location.origin}/overview/${data.raising_id}`, [data.raising_id]);

  const [editing, handleEdit] = useLoadingify(async () => {
    await onEdit?.();
  });

  const [deleting, deleteAction] = useLoadingify(async () => {
    await onDelete?.();
  });

  const handleDelete = withConfirm(data, deleteAction);

  const renderAssets = () => {
    if (!isClosed(data) && isWorking) {
      const power = sponsor ? sponsorPower : servicer ? servicerPower : investorPower;

      return (
        <div className="card-body border-top py-2" style={{ backgroundColor: '#FFFAEB' }}>
          {role === 3 && (
            <div className="d-flex justify-content-between gap-3 py-2">
              <span className="text-gray-dark">我的質押</span>
              <span className="fw-500">{F.formatAmount(investorPledge)} FIL</span>
            </div>
          )}
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">我的資產</span>
            <Link className="fw-500 text-underline" to={`/assets/overview/${data.raising_id}`}>
              <span>{F.formatByte(power)}</span>
              <span>@</span>
              <span>{data.miner_id}</span>
            </Link>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderStatus = () => {
    if (isClosed(data)) {
      return <span className="badge">已關閉</span>;
    }

    if (isInactive) {
      if (role === 1 && sponsor && sponsor.role_level === 1) {
        return <span className="badge">可編輯</span>;
      }

      return <span className="badge">待主辦人簽名</span>;
    }

    if (isActive) {
      const isSuper = sponsor?.role_level === 1;
      const isSponsor = sponsor?.role_level === 2;
      const isInvestor = Boolean(investor);
      const sponsorSigned = Boolean(sponsor?.sign_status);
      const investorSigned = Boolean(investor?.sign_status);

      const status =
        isSponsor && isInvestor ? sponsorSigned && investorSigned : isSponsor ? sponsorSigned : investorSigned;

      const steps = [
        { role: isSuper, signed: isSuper && sponsorSigned },
        { role: isSponsor || isInvestor, signed: status },
        { role: Boolean(servicer), signed: Boolean(servicer?.sign_status) },
      ];

      const step = steps[(role ?? 0) - 1];

      if (step && step.signed) {
        return <span className="badge badge-success">已簽名</span>;
      }

      return <span className="badge badge-danger">待簽名</span>;
    }

    if (isOver) {
      return <span className="badge">已到期</span>;
    }

    if (isWorking) {
      return <span className="badge badge-success">運維中</span>;
    }

    return null;
  };

  return (
    <>
      <div className="card">
        <div className="card-header d-flex align-items-center">
          <div className="flex-shrink-0">
            <Avatar size={{ xs: 32, md: 48, xl: 56 }} address={data.raiser} src={data.sponsor_logo} />
          </div>
          <div className="mx-3 clearfix">
            <span className="badge badge-success ms-1 float-end">@{data.miner_id}</span>
            <h4 className="card-title mb-0 text-truncate">{F.formatSponsor(data.sponsor_company)}掛載的分配計劃</h4>
          </div>
          <div className="flex-shrink-0 ms-auto">
            <ShareBtn className="btn btn-light border-0 shadow-none" text={shareUrl}>
              <IconShare />
            </ShareBtn>
          </div>
        </div>
        <div className="card-body py-2">
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">節點算力</span>
            <span className="fw-500">{F.formatBytes(power)}</span>
          </div>
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">節點質押</span>
            <span className="fw-500">{F.formatAmount(pledge)} FIL</span>
          </div>
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">分配給</span>
            <span className="fw-500">{counter?.investor_count ?? '-'} 地址</span>
          </div>
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">技術服務</span>
            <span className="fw-500">
              <span className="d-inline-block">
                <Avatar address={provider?.wallet_address} size={20} src={provider?.logo_url} />
              </span>
              <span className="align-middle ms-1">
                <span>{provider?.short_name}</span>
              </span>
            </span>
          </div>
        </div>
        {renderAssets()}
        <div className="card-footer d-flex align-items-center gap-3">
          <div className="flex-shrink-0 me-auto">{renderStatus()}</div>
          <div className="d-flex flex-shrink-0 justify-content-between gap-2">
            {isInactive && isSuper && (
              <>
                <SpinBtn
                  className="btn btn-outline-danger border-0 shadow-none"
                  icon={<span className="bi bi-trash3"></span>}
                  loading={deleting}
                  disabled={editing}
                  onClick={handleDelete}
                >
                  刪除
                </SpinBtn>

                <SpinBtn
                  className="btn btn-light"
                  icon={<span className="bi bi-pencil"></span>}
                  loading={editing}
                  disabled={deleting}
                  onClick={handleEdit}
                >
                  編輯
                </SpinBtn>
              </>
            )}
            <Link className="btn btn-success" to={`/overview/${data.raising_id}`}>
              <span className="bi bi-eye"></span>
              <span className="ms-1">查看</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default MountItem;
