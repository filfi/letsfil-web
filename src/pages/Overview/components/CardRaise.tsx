import classNames from 'classnames';
import { useCountDown } from 'ahooks';
import { useEffect, useMemo, useState } from 'react';

import * as H from '@/helpers/app';
import Modal from '@/components/Modal';
import Dialog from '@/components/Dialog';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import useContract from '@/hooks/useContract';
import useProcessify from '@/hooks/useProcessify';
import { day2sec, toF4Address } from '@/utils/utils';
import useRaiseDetail from '@/hooks/useRaiseDetail';
import { formatAmount, formatPower } from '@/utils/format';
import useFactoryContract from '@/hooks/useFactoryContract';
import { ReactComponent as IconCopy } from '@/assets/icons/copy-light.svg';

const calcTime = (mill: number) => {
  return {
    days: Math.floor(mill / 86400000),
    hours: Math.floor(mill / 3600000) % 24,
    minutes: Math.floor(mill / 60000) % 60,
    seconds: Math.floor(mill / 1000) % 60,
    milliseconds: Math.floor(mill) % 1000,
  };
};

const CardRaise: React.FC = () => {
  const { createRaisePlan } = useFactoryContract();
  const { data, asset, role, state } = useRaiseDetail();

  const { power, pledge } = asset;

  const { startRaisePlan, startPreSeal, servicerSign } = useContract(data?.raise_address);

  const { isRaiser, isServicer, isSigned, isOpsPaid, isRaisePaid } = role;
  const { isPending, isWaiting, isRaising, isSuccess, isClosed, isFailed, isWaitSeal, isPreSeal, isSealing, isDelayed, isWorking } = state;

  const [targetDate, setTargetDate] = useState(0);

  const seconds = useMemo(() => {
    if (!data) return 0;

    if (isClosed) {
      if (data.begin_time && data.closing_time) {
        return data.closing_time - data.begin_time;
      }
    }

    if (isRaising || isWaitSeal || isPreSeal) {
      return data.closing_time;
    }

    if (isDelayed || isSealing) {
      return data.end_seal_time;
    }

    if (isSuccess) {
      return day2sec(data.seal_days);
    }

    return day2sec(data.raise_days);
  }, [data, isClosed, isRaising, isWaitSeal, isPreSeal, isSealing, isDelayed, isSuccess]);

  const [, formatted] = useCountDown({ targetDate });
  const raiseTime = useMemo(() => calcTime(seconds * 1000), [seconds]);
  const displayTime = useMemo(
    () => (isRaising || isWaitSeal || isPreSeal || isSealing || isDelayed ? formatted : raiseTime),
    [formatted, raiseTime, isRaising, isWaitSeal, isPreSeal, isSealing, isDelayed],
  );

  useEffect(() => {
    if (isRaising || isWaitSeal || isPreSeal || isDelayed || isSealing) {
      setTargetDate(seconds * 1000);
      return;
    }

    setTargetDate(0);
  }, [seconds, isRaising, isDelayed, isSealing]);

  const [creating, handleCreate] = useProcessify(async () => {
    if (!data) return;

    const raise = H.transformRaiseInfo(data);
    const node = H.transformNodeInfo(data);
    const extra = H.transformExtraInfo(data);

    await createRaisePlan(raise, node, extra);
  });

  const [sealing, sealAction] = useProcessify(async () => {
    if (!data) return;

    await startPreSeal(data.raising_id);
  });

  const [starting, handleStart] = useProcessify(async () => {
    if (!data) return;

    await startRaisePlan(data.raising_id);
  });

  const handleSeal = () => {
    const hide = Dialog.confirm({
      icon: 'error',
      title: '提前启动封装',
      summary: '扇区封装通常是一项需要排期的工作，提前启动注意以下提示',
      content: (
        <div className="text-gray">
          <ul>
            <li>提前沟通技术服务商，与封装排期计划保持同步</li>
            <li>检查节点计划承诺的封装时间，封装延期将产生罚金</li>
          </ul>
        </div>
      ),
      confirmBtnVariant: 'danger',
      confirmText: '提前启动封装',
      onConfirm: () => {
        hide();

        sealAction();
      },
    });
  };

  const [signing, handleSign] = useProcessify(async () => {
    if (!data) return;

    await servicerSign();
  });

  const renderAction = () => {
    // 准备中
    if (isPending) {
      if (isRaiser) {
        return (
          <>
            <div>
              <SpinBtn className="btn btn-primary btn-lg w-100" loading={creating} onClick={handleCreate}>
                主办人签名
              </SpinBtn>
            </div>

            <p className="mb-0">与相关方共识后签名，链上部署后不可修改，但您依然可以创建新的节点计划。</p>
          </>
        );
      }

      if (isServicer) {
        return (
          <>
            <div>
              <SpinBtn className="btn btn-primary btn-lg w-100" disabled>
                技术服务商签名
              </SpinBtn>
            </div>

            <p className="mb-0">等待主办人签名上链，上链后不可更改。之后技术服务商的签名按钮可用。</p>
          </>
        );
      }

      return <p className="mb-0">节点计划尚未开放，收藏页面密切关注投资机会。</p>;
    }

    // 待开始
    if (isWaiting) {
      // 主办人
      if (isRaiser) {
        // 可启动（主办人保证金已缴 且 运维保证金已缴纳 且 已签名）
        const disabled = !(isRaisePaid && isOpsPaid && isSigned);
        return (
          <>
            <div>
              <SpinBtn className="btn btn-primary btn-lg w-100" disabled={disabled} loading={starting} onClick={handleStart}>
                启动集合质押
              </SpinBtn>
            </div>

            <p className="mb-0">查看页面上的红色提示，满足启动条件后启动按钮生效。启动后建设者即可存入FIL。</p>
          </>
        );
      }

      // 技术服务商
      if (isServicer && !isSigned) {
        return (
          <>
            <div>
              <SpinBtn className="btn btn-primary btn-lg w-100" loading={signing} disabled={processing} data-bs-toggle="modal" data-bs-target="#signer-confirm">
                技术服务商签名
              </SpinBtn>
            </div>

            <p className="mb-0">签名即同意节点计划中的约定，您签名后节点计划方可启动。</p>
          </>
        );
      }

      return <p className="mb-0">节点计划尚未开放，收藏页面密切关注投资机会。</p>;
    }

    // 待封装
    if (isWaitSeal && isRaiser) {
      return (
        <>
          <div>
            <SpinBtn className="btn btn-danger btn-lg w-100" loading={sealing} onClick={handleSeal}>
              提前启动封装
            </SpinBtn>
          </div>

          <p className="mb-0">集合质押已成功，可提前开始封装。集合质押金额将转入节点并开始计时。协调技术服务商，避免封装期违约。</p>
        </>
      );
    }

    return null;
  };

  // 封装结束
  if (isWorking) {
    return (
      <>
        <div className="card section-card">
          <div className="card-header d-flex align-items-center border-0">
            <h4 className="card-title mb-0 me-2">节点计划·已完成</h4>
            <span className="badge badge-success ms-auto">集合质押成功</span>
            <span className="badge badge-success ms-2">封装完成</span>
          </div>
          <div className="card-body py-2 fs-16 text-main">
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>封装容量</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{formatPower(power)?.[0]}</span>
                <span className="ms-1 text-neutral">{formatPower(power)?.[1]}</span>
              </span>
            </p>
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>封装质押币</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{formatAmount(pledge)}</span>
                <span className="ms-1 text-neutral">FIL</span>
              </span>
            </p>
            {/* <p className="d-flex align-items-center gap-3 mb-2">
              <span>剩余金额</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">0</span>
                <span className="ms-1 text-neutral">FIL</span>
              </span>
            </p> */}
          </div>
        </div>
      </>
    );
  }

  if (data) {
    return (
      <>
        <div id="card-action" className="card section-card">
          <div className="card-body d-flex flex-column gap-3">
            <div className="d-flex align-items-center flex-wrap gap-2">
              <h4 className="card-title mb-0">
                {isFailed
                  ? '节点计划已结束'
                  : isClosed
                  ? '节点计划已关闭'
                  : isRaising
                  ? '正在集合质押中！距离截止时间'
                  : isWaitSeal || isPreSeal
                  ? '集合质押成功'
                  : isSealing
                  ? '封装倒计时'
                  : isDelayed
                  ? '封装延期'
                  : '集合质押时间'}
              </h4>
              <div className="ms-auto">
                {isFailed ? (
                  <span className="badge badge-danger">集合质押未成功</span>
                ) : isSuccess ? (
                  <span className="badge badge-success">集合质押成功</span>
                ) : null}
                {isPreSeal ? (
                  <span className="badge ms-2">准备封装</span>
                ) : isDelayed ? (
                  <span className="badge badge-warning ms-2">封装延期</span>
                ) : isSealing ? (
                  <span className="badge badge-primary ms-2">正在封装</span>
                ) : null}
              </div>
            </div>

            <div
              className={classNames('d-flex justify-content-between text-center lh-1', {
                'text-gray': isClosed || isFailed,
                'text-main': !isClosed && !isFailed,
              })}
            >
              <div className="countdown-item">
                <p className="h2 fw-bold mb-1">{displayTime.days}</p>
                <p className="mb-0 text-gray">天</p>
              </div>
              <div className="countdown-item">
                <p className="h2 fw-bold mb-1">{displayTime.hours}</p>
                <p className="mb-0 text-gray">小时</p>
              </div>
              <div className="countdown-item">
                <p className="h2 fw-bold mb-1">{displayTime.minutes}</p>
                <p className="mb-0 text-gray">分</p>
              </div>
              <div className="countdown-item">
                <p className="h2 fw-bold mb-1">{displayTime.seconds}</p>
                <p className="mb-0 text-gray">秒</p>
              </div>
            </div>

            {renderAction()}
          </div>
        </div>

        <Modal.Alert id="signer-confirm" footerClassName="border-0" title="移交Owner地址" confirmText="签名" confirmLoading={signing} onConfirm={handleSign}>
          <div className="p-3">
            <p className="mb-0 fs-16 fw-500">
              <span>在安全环境下执行以下命令，将Owner地址修改为智能合约地址。</span>
              {/* <a className="text-underline" href="#">
                如何收回Owner地址？
              </a> */}
            </p>

            <div className="p-2 border rounded-1 my-4">
              <div className="d-flex align-items-start bg-dark rounded-1 p-2">
                <span className="flex-shrink-0 text-white fw-600">$</span>
                <div className="flex-grow-1 mx-2 fw-600 text-wrap text-success">
                  lotus-miner actor set-owner --really-do-it {toF4Address(data.raise_address)} &lt;ownerAddress&gt;
                </div>
                <ShareBtn className="btn p-0" text={`lotus-miner actor set-owner --really-do-it ${toF4Address(data.raise_address)} <ownerAddress>`}>
                  <IconCopy />
                </ShareBtn>
              </div>
            </div>

            <p className="mb-0 fs-16 fw-500">执行成功后点击“签名”按钮。</p>
          </div>
        </Modal.Alert>
      </>
    );
  }

  return null;
};

export default CardRaise;
