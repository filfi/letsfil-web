import { Avatar } from 'antd';
import { useMemo } from 'react';
import { Link } from '@umijs/max';

import * as F from '@/utils/format';
import Countdown from './Countdown';
import Dialog from '@/components/Dialog';
import { catchify } from '@/utils/hackify';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import { RaiseState } from '@/constants/state';
import useRaiseRate from '@/hooks/useRaiseRate';
import useLoadingify from '@/hooks/useLoadingify';
import useProcessify from '@/hooks/useProcessify';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import useRaiseState from '@/hooks/useRaiseState';
import { accSub, sec2day } from '@/utils/utils';
import useDepositInvest from '@/hooks/useDepositInvest';
import { ReactComponent as IconShare } from '@/assets/icons/share-06.svg';

function withConfirm<R, P extends unknown[]>(data: API.Plan, handler: (...args: P) => Promise<R>) {
  return (...args: P) => {
    const isClosed = data.status === RaiseState.Closed;
    const isPending = data.status === RaiseState.Pending;

    const actionHandler = async () => {
      const [e] = await catchify(handler)(...args);

      if (e) {
        Dialog.alert({
          icon: 'error',
          title: '操作失败',
          content: e.message,
        });
      }
    };

    const hide = Dialog.confirm({
      icon: 'delete',
      title: isPending ? '删除募集计划' : '隐藏募集计划',
      summary: isPending ? '未签名的募集计划可以永久删除。' : `隐藏${isClosed ? '已关闭' : '募集失败'}的募集计划。`,
      onConfirm: () => {
        hide();

        actionHandler();
      },
    });
  };
}

const Item: React.FC<{
  data: API.Plan;
  invest?: boolean;
  onEdit?: () => void;
  onHide?: () => Promise<any>;
  onDelete?: () => Promise<any>;
  onStart?: () => Promise<any>;
  getProvider?: (id?: number | string) => API.Provider | undefined;
}> = ({ data, invest, getProvider, onEdit, /* onHide, */ onDelete, onStart }) => {
  const { pack } = useRaiseSeals(data);
  const { investRate } = useRaiseRate(data);
  const { amount, progress, total, target } = useDepositInvest(data);
  const { isRaiser, isSigned, isOpsPaid, isRaisePaid, ...state } = useRaiseState(data);

  const calcSealDays = (data: API.Plan) => {
    const r: string[] = [];

    // 生产中
    if (state.isWorking) {
      const sec = Math.max(accSub(data.end_seal_time, data.begin_seal_time), 0);
      r.push(`${sec2day(sec)}天`);
      r.push(`承诺${data.seal_days}天`);

      return r;
    }

    r.push(`< ${data.seal_days} 天`);

    // 封装中
    if (state.isSealing || state.isDelayed) {
      const sec = Math.max(accSub(Date.now() / 1000, data.begin_seal_time));
      r.push(`已进行${sec2day(sec)}天`);
    }

    return r;
  };

  const sealDays = useMemo(() => calcSealDays(data), [data, state]);
  const provider = useMemo(() => getProvider?.(data.service_id), [data.service_id, getProvider]);
  const shareUrl = useMemo(() => `${location.origin}/overview/${data.raising_id}`, [data.raising_id]);

  const [deleting, deleteAction] = useLoadingify(async () => {
    await onDelete?.();
  });

  const [starting, handleStart] = useProcessify(async () => {
    await onStart?.();
  });

  // const handleHide = withConfirm(data, hideAction);
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
              <Link className="fw-500 text-underline" to={`/assets/${pack.raising_id}`}>
                <span>{F.formatByte(pack.pack_power)}</span>
                <span>@</span>
                <span>{pack.miner_id}</span>
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
      return <span className="badge">可编辑</span>;
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
          <span className="badge badge-success">募集中</span>
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
          <span className="badge badge-danger">募集失败</span>
          {amount > 0 && <span className="ms-2 fs-sm text-danger">您有资产待取回</span>}
        </>
      );
    }
    if (state.isWaitSeal) {
      return <span className="badge">待封装</span>;
    }
    if (state.isSealing) {
      return (
        <>
          <span className="badge badge-warning">封装中</span>
          <span className="ms-2 fs-sm text-gray">
            <Countdown time={data.end_seal_time} />
          </span>
        </>
      );
    }
    if (state.isDelayed) {
      return (
        <>
          <span className="badge badge-warning">封装延期</span>
          <span className="ms-2 fs-sm text-gray">
            <Countdown time={data.end_seal_time} />
          </span>
        </>
      );
    }
    if (state.isWorking) {
      const sec = Math.max(accSub(Date.now() / 1000, data.begin_seal_time), 0);
      return (
        <>
          <span className="badge badge-primary">生产中</span>
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
            <Avatar size={{ xs: 32, md: 48, xl: 56 }} src={data.sponsor_logo} />
          </div>
          <div className="mx-3 clearfix">
            <span className="badge badge-primary ms-1 float-end">@{data.miner_id}</span>
            <h4 className="card-title mb-0 text-truncate">{data.sponsor_company}发起的募集计划</h4>
          </div>
          <div className="flex-shrink-0 ms-auto">
            <ShareBtn className="btn btn-light border-0 shadow-none" text={shareUrl}>
              <IconShare />
            </ShareBtn>
          </div>
        </div>
        <div className="card-body py-2">
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">{state.isSuccess ? '实际募集' : '募集目标'}</span>
            <span className="fw-500">
              <span>{state.isSuccess ? F.formatAmount(total) : F.formatAmount(target)} FIL</span>
              {progress > 0 && (
                <>
                  <span> · </span>
                  <span>
                    {state.isSuccess ? '达到目标的' : '已募集'}
                    {F.formatRate(progress)}
                  </span>
                </>
              )}
            </span>
          </div>
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">投资人分成比例</span>
            <span className="fw-500">{investRate}%</span>
          </div>
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">{state.isFinished ? '实际封装时间' : '承诺封装时间'}</span>
            <span className="fw-500">{state.isFinished ? sealDays.join(' / ') : sealDays.join(' · ')}</span>
          </div>
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">技术服务</span>
            <span className="fw-500">
              <span className="d-inline-block">
                <Avatar size={20} src={provider?.logo_url} />
              </span>
              <span className="align-middle ms-1">
                <span>{provider?.short_name}</span>
                <span className="mx-1">·</span>
                <span>保证金{data.ops_security_fund_rate}%</span>
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
