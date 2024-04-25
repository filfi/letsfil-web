import { useMemo } from 'react';
import { Link } from '@umijs/max';

import * as F from '@/utils/format';
import { catchify } from '@/utils/hackify';
import { accSub, sec2day } from '@/utils/utils';
import Countdown from './Countdown';
import Avatar from '@/components/Avatar';
import Dialog from '@/components/Dialog';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import usePackInfo from '@/hooks/usePackInfo';
import useRaiseBase from '@/hooks/useRaiseBase';
import useRaiseRate from '@/hooks/useRaiseRate';
import useRaiseRole from '@/hooks/useRaiseRole';
import useSProvider from '@/hooks/useSProvider';
import useAssetPack from '@/hooks/useAssetPack';
import useLoadingify from '@/hooks/useLoadingify';
import useProcessify from '@/hooks/useProcessify';
import useRaiseState from '@/hooks/useRaiseState';
import useDepositInvestor from '@/hooks/useDepositInvestor';
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
      title: '刪除節點計劃',
      summary: '未簽名的節點計劃可以永久刪除。',
      onConfirm: () => {
        hide();

        actionHandler();
      },
    });
  };
}

const RaiseItem: React.FC<{
  data: API.Plan;
  role?: number;
  onEdit?: () => Promise<any>;
  onDelete?: () => Promise<any>;
}> = ({ data, role, onEdit, onDelete }) => {
  const state = useRaiseState(data);
  const { data: pack } = usePackInfo(data);
  const { amount } = useDepositInvestor(data);
  const provider = useSProvider(data.service_id);
  const { isSealing, isDelayed } = useRaiseState(data);
  const { priorityRate, opsRatio } = useRaiseRate(data);
  const { actual, progress, target } = useRaiseBase(data);
  const { sealProgress: sealPercent } = useAssetPack(data, pack);
  const { isSuper, isSigned, isOpsPaid, isRaisePaid } = useRaiseRole(data);

  const calcSealDays = () => {
    const r: string[] = [];

    let res = `< ${data.seal_days} 天`;

    if (data.end_seal_time) {
      res = F.formatUnixDate(data.end_seal_time);
    }

    r.push(res);

    // 封装中
    if (isSealing || isDelayed) {
      const sec = Math.max(accSub(Date.now() / 1000, data.begin_seal_time));
      r.push(`已進行${sec2day(sec)}天`);
    }

    return r;
  };

  const sealDays = useMemo(() => calcSealDays(), [data, isDelayed, isSealing]);
  const power = useMemo(() => +`${pack?.total_power || 0}`, [pack?.total_power]);
  const shareUrl = useMemo(() => `${location.origin}/overview/${data.raising_id}`, [data.raising_id]);

  const [editing, handleEdit] = useProcessify(async () => {
    await onEdit?.();
  });

  const [deleting, deleteAction] = useLoadingify(async () => {
    await onDelete?.();
  });

  const handleDelete = withConfirm(data, deleteAction);

  const renderAssets = () => {
    const showPack = state.isWorking && pack;
    const showAssets = role === 3 && amount > 0;

    if (showAssets || showPack) {
      return (
        <div className="card-body border-top py-2" style={{ backgroundColor: '#FFFAEB' }}>
          {showAssets && (
            <div className="d-flex justify-content-between gap-3 py-2">
              <span className="text-gray-dark">我的質押</span>
              <span className="fw-500">{F.formatAmount(amount)} FIL</span>
            </div>
          )}
          {showPack && (
            <div className="d-flex justify-content-between gap-3 py-2">
              <span className="text-gray-dark">我的資產</span>
              <Link className="fw-500 text-underline" to={`/assets/overview/${data.raising_id}`}>
                <span>{F.formatByte(power)}</span>
                <span>@</span>
                <span>{data.miner_id}</span>
              </Link>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const renderStatus = () => {
    if (state.isPending) {
      if (role === 1 && isSuper) {
        return <span className="badge">可編輯</span>;
      }

      return <span className="badge">待主辦人簽名</span>;
    }
    if (state.isWaiting) {
      if (!isRaisePaid || !isOpsPaid) {
        return <span className="badge badge-danger">待繳保證金</span>;
      }

      if (!isSigned) {
        return <span className="badge badge-danger">待服務商簽名</span>;
      }

      return <span className="badge">待開放</span>;
    }
    if (state.isRaising) {
      return (
        <>
          <span className="badge badge-success">質押中</span>
          <span className="ms-2 fs-sm text-gray">
            <Countdown time={data.closing_time} />
          </span>
        </>
      );
    }
    if (state.isClosed) {
      return (
        <>
          <span className="badge">已關閉</span>
          {amount > 0 && <span className="ms-2 fs-sm text-danger">您有資產待取回</span>}
        </>
      );
    }
    if (state.isFailed) {
      return (
        <>
          <span className="badge badge-danger">質押失敗</span>
          {amount > 0 && <span className="ms-2 fs-sm text-danger">您有資產待取回</span>}
        </>
      );
    }
    if (state.isWaitSeal) {
      return <span className="badge">準備封裝</span>;
    }
    if (state.isSealing) {
      return (
        <>
          <span className="badge badge-warning">封裝中</span>
          <span className="ms-2 fs-sm text-gray">{F.formatRate(sealPercent)}</span>
        </>
      );
    }
    if (state.isDelayed) {
      return (
        <>
          <span className="badge badge-warning">封裝延期</span>
          <span className="ms-2 fs-sm text-gray">{F.formatRate(sealPercent)}</span>
        </>
      );
    }
    if (state.isDestroyed) {
      return <span className="badge">已到期</span>;
    }
    if (state.isWorking) {
      const sec = Math.max(accSub(Date.now() / 1000, data.begin_seal_time), 0);
      return (
        <>
          <span className="badge badge-primary">營運中</span>
          <span className="ms-2 fs-sm text-gray">已運行 {sec2day(sec)} 天</span>
        </>
      );
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
            <span className="badge badge-primary ms-1 float-end">@{data.miner_id}</span>
            <h4 className="card-title mb-0 text-truncate">{F.formatSponsor(data.sponsor_company)}發起的節點計劃</h4>
          </div>
          <div className="flex-shrink-0 ms-auto">
            <ShareBtn className="btn btn-light border-0 shadow-none" text={shareUrl}>
              <IconShare />
            </ShareBtn>
          </div>
        </div>
        <div className="card-body py-2">
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">{state.isSuccess ? '實際質押' : '質押目標'}</span>
            <span className="fw-500">
              <span>{state.isSuccess ? F.formatAmount(actual) : F.formatAmount(target)} FIL</span>
              {progress > 0 && (
                <>
                  <span> · </span>
                  <span>
                    {state.isSuccess ? '達到目標的' : '已質押'}
                    {F.formatProgress(progress)}
                  </span>
                </>
              )}
            </span>
          </div>
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">建設者獲得</span>
            <span className="fw-500">{priorityRate}%</span>
          </div>
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">封裝截止</span>
            <span className="fw-500">{sealDays.join(' · ')}</span>
          </div>
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">技術服務</span>
            <span className="fw-500">
              <span className="d-inline-block">
                <Avatar address={provider?.wallet_address} size={20} src={provider?.logo_url} />
              </span>
              <span className="align-middle ms-1">
                <span>{provider?.short_name}</span>
                <span className="mx-1">·</span>
                <span>保證金{opsRatio}%</span>
              </span>
            </span>
          </div>
        </div>
        {renderAssets()}
        <div className="card-footer d-flex align-items-center gap-3">
          <div className="flex-shrink-0 me-auto">{renderStatus()}</div>
          <div className="d-flex flex-shrink-0 justify-content-between gap-2">
            {state.isPending && isSuper && (
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
            <Link className="btn btn-primary" to={`/overview/${data.raising_id}`}>
              <span className="bi bi-eye"></span>
              <span className="ms-1">查看</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default RaiseItem;
