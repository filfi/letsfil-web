import { useMemo } from 'react';
import { Link } from '@umijs/max';

import * as F from '@/utils/format';
import { catchify } from '@/utils/hackify';
import Avatar from '@/components/Avatar';
import Dialog from '@/components/Dialog';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import useMinerInfo from '@/hooks/useMinerInfo';
import useRaiseRate from '@/hooks/useRaiseRate';
import useRaiseRole from '@/hooks/useRaiseRole';
import useSProvider from '@/hooks/useSProvider';
import useLoadingify from '@/hooks/useLoadingify';
import useMountState from '@/hooks/useMountState';
import useInvestorCount from '@/hooks/useInvestorCount';
import { ReactComponent as IconShare } from '@/assets/icons/share-06.svg';

function withConfirm<R, P extends unknown[]>(data: API.Plan, handler: (...args: P) => Promise<R>) {
  return (...args: P) => {
    const actionHandler = async () => {
      const [e] = await catchify(handler)(...args);

      if (e) {
        Dialog.alert({
          icon: 'error',
          title: '删除失败',
          content: e.message,
        });
      }
    };

    const hide = Dialog.confirm({
      icon: 'delete',
      title: '删除分配计划',
      summary: '未签名的分配计划可以永久删除。',
      onConfirm: () => {
        hide();

        actionHandler();
      },
    });
  };
}

const MountItem: React.FC<{
  data: API.Plan;
  invest?: boolean;
  onEdit?: () => void;
  onHide?: () => Promise<any>;
  onDelete?: () => Promise<any>;
  onStart?: () => Promise<any>;
}> = ({ data, onEdit, onDelete }) => {
  const state = useMountState(data);
  const { opsRatio } = useRaiseRate(data);
  const { isRaiser } = useRaiseRole(data);
  const provider = useSProvider(data.service_id);
  const { data: counter } = useInvestorCount(data);
  const { data: info } = useMinerInfo(data.miner_id);

  const power = useMemo(() => +`${info?.miner_power || 0}`, [info?.miner_power]);
  const pledge = useMemo(() => F.toNumber(info?.initial_pledge), [info?.initial_pledge]);
  const shareUrl = useMemo(() => `${location.origin}/overview/${data.raising_id}`, [data.raising_id]);

  const [deleting, deleteAction] = useLoadingify(async () => {
    await onDelete?.();
  });

  const handleDelete = withConfirm(data, deleteAction);

  const renderStatus = () => {
    if (state.isInactive) {
      if (isRaiser) {
        return <span className="badge">可编辑</span>;
      }

      return <span className="badge-danger">待签名</span>;
    }
    if (state.isActive) {
      return <span className="badge badge-primary">签名中</span>;
    }
    if (state.isWorking) {
      return <span className="badge badge-success">运行中</span>;
    }

    return null;
  };

  const renderActions = () => {
    const editable = state.isInactive;
    const deletable = state.isInactive;

    return (
      <>
        {deletable && (
          <SpinBtn
            className="btn btn-outline-danger border-0 shadow-none"
            loading={deleting}
            icon={<span className="bi bi-trash3"></span>}
            onClick={handleDelete}
          >
            删除
          </SpinBtn>
        )}

        {editable && (
          <button className="btn btn-outline-light" type="button" onClick={onEdit}>
            <span className="bi bi-pencil"></span>
            <span className="ms-1">编辑</span>
          </button>
        )}
      </>
    );
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
            <h4 className="card-title mb-0 text-truncate">{F.formatSponsor(data.sponsor_company)}挂载的分配计划</h4>
          </div>
          <div className="flex-shrink-0 ms-auto">
            <ShareBtn className="btn btn-light border-0 shadow-none" text={shareUrl}>
              <IconShare />
            </ShareBtn>
          </div>
        </div>
        <div className="card-body py-2">
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">节点算力</span>
            <span className="fw-500">{F.formatBytes(power)}</span>
          </div>
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">节点质押</span>
            <span className="fw-500">{F.formatAmount(pledge)} FIL</span>
          </div>
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">分配给</span>
            <span className="fw-500">{counter?.investor_count ?? '-'} 地址</span>
          </div>
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">技术服务</span>
            <span className="fw-500">
              <span className="d-inline-block">
                <Avatar address={provider?.wallet_address} size={20} src={provider?.logo_url} />
              </span>
              <span className="align-middle ms-1">
                <span>{provider?.short_name}</span>
                <span className="mx-1">·</span>
                <span>保证金{opsRatio}%</span>
              </span>
            </span>
          </div>
        </div>

        <div className="card-footer d-flex align-items-center gap-3">
          <div className="flex-shrink-0 me-auto">{renderStatus()}</div>
          <div className="d-flex flex-shrink-0 justify-content-between gap-2">
            {isRaiser && renderActions()}
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
