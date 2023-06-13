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
import useRaiseInfo from '@/hooks/useRaiseInfo';
import useRaiseRate from '@/hooks/useRaiseRate';
import useRaiseRole from '@/hooks/useRaiseRole';
import useSProvider from '@/hooks/useSProvider';
import useLoadingify from '@/hooks/useLoadingify';
import useProcessify from '@/hooks/useProcessify';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import useRaiseState from '@/hooks/useRaiseState';
import useDepositInvestor from '@/hooks/useDepositInvestor';
import { isDelayed, isSealing, isWorking } from '@/helpers/raise';
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
      title: '删除节点计划',
      summary: '未签名的节点计划可以永久删除。',
      onConfirm: () => {
        hide();

        actionHandler();
      },
    });
  };
}

function calcSealDays(data: API.Plan) {
  const r: string[] = [];

  // 运营中
  if (isWorking(data)) {
    const sec = Math.max(accSub(data.end_seal_time, data.begin_seal_time), 0);
    r.push(`${F.formatSeals(sec2day(sec))}天`);
    r.push(`承诺${data.seal_days}天`);

    return r;
  }

  r.push(`< ${data.seal_days} 天`);

  // 封装中
  if (isSealing(data) || isDelayed(data)) {
    const sec = Math.max(accSub(Date.now() / 1000, data.begin_seal_time));
    r.push(`已进行${sec2day(sec)}天`);
  }

  return r;
}

const Item: React.FC<{
  data: API.Plan;
  invest?: boolean;
  onEdit?: () => void;
  onHide?: () => Promise<any>;
  onDelete?: () => Promise<any>;
  onStart?: () => Promise<any>;
}> = ({ data, invest, onEdit, onDelete, onStart }) => {
  const state = useRaiseState(data);
  const { data: pack } = usePackInfo(data);
  const { amount } = useDepositInvestor(data);
  const provider = useSProvider(data.service_id);
  const { progress: sealPercent } = useRaiseSeals(data);
  const { priorityRate, opsRatio } = useRaiseRate(data);
  const { actual, progress, target } = useRaiseInfo(data);
  const { isRaiser, isSigned, isOpsPaid, isRaisePaid } = useRaiseRole(data);

  const sealDays = useMemo(() => calcSealDays(data), [data]);
  const power = useMemo(() => +`${pack?.total_power || 0}`, [pack?.total_power]);
  const shareUrl = useMemo(() => `${location.origin}/overview/${data.raising_id}`, [data.raising_id]);

  const [deleting, deleteAction] = useLoadingify(async () => {
    await onDelete?.();
  });

  const [starting, handleStart] = useProcessify(async () => {
    await onStart?.();
  });

  const handleDelete = withConfirm(data, deleteAction);

  const renderAssets = () => {
    const showPack = state.isWorking && pack;
    const showAssets = invest && amount > 0;

    if (showAssets || showPack) {
      return (
        <div className="card-body border-top py-2" style={{ backgroundColor: '#FFFAEB' }}>
          {showAssets && (
            <div className="d-flex justify-content-between gap-3 py-2">
              <span className="text-gray-dark">我的投入</span>
              <span className="fw-500">{F.formatAmount(amount)} FIL</span>
            </div>
          )}
          {showPack && (
            <div className="d-flex justify-content-between gap-3 py-2">
              <span className="text-gray-dark">我的资产</span>
              <Link className="fw-500 text-underline" to={`/assets/${data.raising_id}`}>
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
      if (isRaiser) {
        return <span className="badge">可编辑</span>;
      }

      return <span className="badge">待主办人签名</span>;
    }
    if (state.isWaiting) {
      if (!isRaisePaid || !isOpsPaid) {
        return <span className="badge badge-danger">待缴纳保证金</span>;
      }

      if (!isSigned) {
        return <span className="badge badge-danger">待服务商签名</span>;
      }

      return <span className="badge">待启动</span>;
    }
    if (state.isRaising) {
      return (
        <>
          <span className="badge badge-success">集合质押中</span>
          <span className="ms-2 fs-sm text-gray">
            <Countdown time={data.closing_time} />
          </span>
        </>
      );
    }
    if (state.isClosed) {
      return (
        <>
          <span className="badge">已关闭</span>
          {amount > 0 && <span className="ms-2 fs-sm text-danger">您有资产待取回</span>}
        </>
      );
    }
    if (state.isFailed) {
      return (
        <>
          <span className="badge badge-danger">集合质押失败</span>
          {amount > 0 && <span className="ms-2 fs-sm text-danger">您有资产待取回</span>}
        </>
      );
    }
    if (state.isWaitSeal || state.isPreSeal) {
      return <span className="badge">准备封装</span>;
    }
    if (state.isSealing) {
      return (
        <>
          <span className="badge badge-warning">封装中</span>
          <span className="ms-2 fs-sm text-gray">{F.formatRate(sealPercent)}</span>
        </>
      );
    }
    if (state.isDelayed) {
      return (
        <>
          <span className="badge badge-warning">封装延期</span>
          <span className="ms-2 fs-sm text-gray">{F.formatRate(sealPercent)}</span>
        </>
      );
    }
    if (state.isWorking) {
      const sec = Math.max(accSub(Date.now() / 1000, data.begin_seal_time), 0);
      return (
        <>
          <span className="badge badge-primary">运营中</span>
          <span className="ms-2 fs-sm text-gray">已运行 {sec2day(sec)} 天</span>
        </>
      );
    }

    return null;
  };

  const renderActions = () => {
    const editable = state.isPending;
    const deletable = state.isPending;
    const startable = state.isWaiting && isRaisePaid && isOpsPaid && isSigned;

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

        {startable && (
          <SpinBtn className="btn btn-light" loading={starting} icon={<span className="bi bi-play"></span>} onClick={handleStart}>
            启动
          </SpinBtn>
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
            <span className="badge badge-primary ms-1 float-end">@{data.miner_id}</span>
            <h4 className="card-title mb-0 text-truncate">{F.formatSponsor(data.sponsor_company)}发起的节点计划</h4>
          </div>
          <div className="flex-shrink-0 ms-auto">
            <ShareBtn className="btn btn-light border-0 shadow-none" text={shareUrl}>
              <IconShare />
            </ShareBtn>
          </div>
        </div>
        <div className="card-body py-2">
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">{state.isSuccess ? '实际集合质押' : '质押目标'}</span>
            <span className="fw-500">
              <span>{state.isSuccess ? F.formatAmount(actual) : F.formatAmount(target)} FIL</span>
              {progress > 0 && (
                <>
                  <span> · </span>
                  <span>
                    {state.isSuccess ? '达到目标的' : '已集合质押'}
                    {F.formatProgress(progress)}
                  </span>
                </>
              )}
            </span>
          </div>
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">建设者获得</span>
            <span className="fw-500">{priorityRate}%</span>
          </div>
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">封装时间</span>
            <span className="fw-500">{state.isWorking ? sealDays.join(' / ') : sealDays.join(' · ')}</span>
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
        {renderAssets()}
        <div className="card-footer d-flex align-items-center gap-3">
          <div className="flex-shrink-0 me-auto">{renderStatus()}</div>
          <div className="d-flex flex-shrink-0 justify-content-between gap-2">
            {isRaiser && renderActions()}
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

export default Item;
