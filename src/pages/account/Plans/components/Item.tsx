import { Avatar } from 'antd';
import { useMemo } from 'react';
import { Link } from '@umijs/max';

import { accMul } from '@/utils/utils';
import Dialog from '@/components/Dialog';
import { catchify } from '@/utils/hackify';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import { RaiseState } from '@/constants/state';
import useLoadingify from '@/hooks/useLoadingify';
import useDepositInvest from '@/hooks/useDepositInvest';
import { formatEther, formatNum, formatRate } from '@/utils/format';
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

function calcSealDays(data: API.Plan) {
  const r: string[] = [];

  // 封装结束
  if (data.end_seal_time && data.begin_seal_time) {
    r.push(formatNum((data.end_seal_time - data.begin_seal_time) / 86400, '0.0') + ' 天');
    r.push(`承诺${data.seal_days}天`);

    return r;
  }

  if (data.seal_days < 7) {
    r.push('< 7 天');
  } else {
    r.push(`${data.seal_days} 天`);
  }

  // 封装中
  if (data.begin_seal_time) {
    r.push(`已进行${formatNum((Date.now() / 1000 - data.begin_seal_time) / 86400, '0.0')}天`);
  }

  return r;
}

const Item: React.FC<{
  data: API.Plan;
  onEdit?: () => void;
  onHide?: () => Promise<any>;
  onDelete?: () => Promise<any>;
  onStart?: () => Promise<any>;
  getProvider?: (id?: number | string) => API.Provider | undefined;
}> = ({ data, getProvider, onEdit, onHide, onDelete, onStart }) => {
  const { percent } = useDepositInvest(data);
  const isSuccess = useMemo(() => data.status === RaiseState.Success, [data.status]);
  const isSealing = useMemo(() => isSuccess && data.begin_seal_time, [isSuccess, data.begin_seal_time]);
  const isFinished = useMemo(() => isSuccess && data.end_seal_time, [isSuccess, data.end_seal_time]);
  const isSigned = useMemo(() => data.sp_sign_status === 1, [data.sp_sign_status]);
  const isOpsPaid = useMemo(() => data.sp_margin_status === 1, [data.sp_margin_status]);
  const isRaisePaid = useMemo(() => data.raise_margin_status === 1, [data.raise_margin_status]);
  const rate = useMemo(() => accMul(data.raiser_coin_share, 0.95), [data.raiser_coin_share]);
  const sealDays = useMemo(() => calcSealDays(data), [data]);
  const provider = useMemo(() => getProvider?.(data.service_id), [data.service_id, getProvider]);

  const [hiding, hideAction] = useLoadingify(async () => {
    await onHide?.();
  });

  const [deleting, deleteAction] = useLoadingify(async () => {
    await onDelete?.();
  });

  const [starting, handleStart] = useLoadingify(async () => {
    await onStart?.();
  });

  const handleHide = withConfirm(data, hideAction);
  const handleDelete = withConfirm(data, deleteAction);

  const renderStatus = () => {
    switch (data.status) {
      case RaiseState.WaitingStart:
        if (!isRaisePaid || !isOpsPaid) {
          return <span className="badge badge-danger">待缴纳保证金</span>;
        }

        if (!isSigned) {
          return <span className="badge badge-danger">待服务商签名</span>;
        }

        return <span className="badge">待启动</span>;
      case RaiseState.Raising:
        return <span className="badge badge-success">募集中</span>;
      case RaiseState.Closed:
        return <span className="badge">已关闭</span>;
      case RaiseState.Failure:
        return <span className="badge badge-danger">募集失败</span>;
      case RaiseState.Success:
        if (isFinished) {
          return <span className="badge badge-primary">生产中</span>;
        }

        if (isSealing) {
          return <span className="badge badge-warning">封装中</span>;
        }

        return <span className="badge">待封装</span>;
      case 10:
        return <span className="badge">可编辑</span>;
    }
  };

  const renderActions = () => {
    const editable = RaiseState.Pending === data.status;
    const deletable = RaiseState.Pending === data.status;
    const hidable = [RaiseState.Closed, RaiseState.Failure].includes(data.status);
    const startable = data.status === RaiseState.WaitingStart && isRaisePaid && isOpsPaid && isSigned;

    return (
      <>
        {deletable ? (
          <SpinBtn
            className="btn btn-outline-danger border-0 shadow-none"
            loading={deleting}
            icon={<span className="bi bi-trash3"></span>}
            onClick={handleDelete}
          >
            删除
          </SpinBtn>
        ) : hidable ? (
          <SpinBtn
            className="btn btn-outline-danger border-0 shadow-none"
            loading={hiding}
            icon={<span className="bi bi-eye-slash"></span>}
            onClick={handleHide}
          >
            隐藏
          </SpinBtn>
        ) : null}

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
            <ShareBtn className="btn btn-light border-0 shadow-none" text="">
              <IconShare />
            </ShareBtn>
          </div>
        </div>
        <div className="card-body py-2">
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">{isSuccess ? '实际募集' : '募集目标'}</span>
            <span className="fw-500">
              <span>{formatEther(data.target_amount)} FIL</span>
              {percent > 0 && (
                <>
                  <span> · </span>
                  <span>
                    {isSuccess ? '达到目标的' : '已募集'}
                    {formatRate(percent)}
                  </span>
                </>
              )}
            </span>
          </div>
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">投资人分成比例</span>
            <span className="fw-500">{rate}%</span>
          </div>
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">{isFinished ? '实际封装时间' : '承诺封装时间'}</span>
            <span className="fw-500">{isFinished ? sealDays.join(' / ') : sealDays.join(' · ')}</span>
          </div>
          <div className="d-flex justify-content-between gap-3 py-2">
            <span className="text-gray-dark">技术服务</span>
            <span className="fw-500">
              <Avatar size={24} src={provider?.logo_url} />
              <span className="ms-1">{provider?.short_name}</span>
              <span className="mx-1">·</span>
              <span>保证金{data.ops_security_fund_rate}%</span>
            </span>
          </div>
        </div>
        <div className="card-footer d-flex align-items-center gap-3">
          <div className="flex-shrink-0 me-auto">{renderStatus()}</div>
          <div className="d-flex flex-shrink-0 justify-content-between gap-2">
            {renderActions()}
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
