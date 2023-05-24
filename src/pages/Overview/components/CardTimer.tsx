import classNames from 'classnames';
import { useCountDown } from 'ahooks';
import { useModel } from '@umijs/max';
import { useEffect, useMemo, useState } from 'react';

import * as H from '@/helpers/app';
import { day2sec } from '@/utils/utils';
import Modal from '@/components/Modal';
import Dialog from '@/components/Dialog';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import useRaiseState from '@/hooks/useRaiseState';
import useProcessify from '@/hooks/useProcessify';
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

const CardTimer: React.FC<{ data?: API.Plan }> = ({ data }) => {
  const { initialState } = useModel('@@initialState');
  const { createRaisePlan } = useFactoryContract();
  const {
    contract,
    isRaiser,
    isServicer,
    isPending,
    isWaiting,
    isRaising,
    isSuccess,
    isClosed,
    isFailed,
    isSealing,
    isDelayed,
    isFinished,
    isDestroyed,
    isSigned,
    isOpsPaid,
    isRaisePaid,
  } = useRaiseState(data);

  const [targetDate, setTargetDate] = useState(0);

  const seconds = useMemo(() => {
    if (!data) return 0;

    if (isClosed || isFailed) {
      if (data.closing_time > data.begin_time) {
        return data.closing_time - data.begin_time;
      }
    }

    if (isRaising) {
      return data.closing_time;
    }

    if (isDelayed) {
      return data.delay_seal_time;
    }

    if (isSealing) {
      return data.end_seal_time;
    }

    if (isSuccess) {
      return day2sec(data.seal_days);
    }

    return day2sec(data.raise_days);
  }, [data, isClosed, isFailed, isRaising, isDelayed, isSealing, isSuccess]);

  const [, formatted] = useCountDown({ targetDate });
  const raiseTime = useMemo(() => calcTime(seconds * 1000), [seconds]);
  const displayTime = useMemo(() => (isRaising || isDelayed || isSealing ? formatted : raiseTime), [formatted, raiseTime, isRaising, isDelayed, isSealing]);

  useEffect(() => {
    if (isRaising || isDelayed || isSealing) {
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

    await contract.startSeal(data.raising_id);
  });

  const [starting, handleStart] = useProcessify(async () => {
    if (!data) return;

    await contract.startRaisePlan(data.raising_id);
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
            <li>检查募集计划承诺的封装时间，封装延期将产生罚金</li>
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

    await contract.servicerSign();
  });

  const renderAction = () => {
    // 准备中
    if (isPending) {
      if (isRaiser) {
        return (
          <>
            <div>
              <SpinBtn className="btn btn-primary btn-lg w-100" loading={creating} onClick={handleCreate}>
                发起人签名
              </SpinBtn>
            </div>

            <p className="mb-0">与相关方共识后签名，链上部署后不可修改，但您依然可以创建新的募集计划。</p>
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

            <p className="mb-0">等待发起人签名上链，上链后不可更改。之后技术服务商的签名按钮可用。</p>
          </>
        );
      }
    }

    // 待开始
    if (isWaiting) {
      // 发起人
      if (isRaiser) {
        // 可启动（募集保证金已缴 且 运维保证金已缴纳 且 已签名）
        const disabled = !(isRaisePaid && isOpsPaid && isSigned);
        return (
          <>
            <div>
              <SpinBtn className="btn btn-primary btn-lg w-100" disabled={disabled} loading={starting} onClick={handleStart}>
                启动募集
              </SpinBtn>
            </div>

            <p className="mb-0">查看页面上的红色提示，满足启动条件后启动按钮生效。启动后投资人即可存入FIL。</p>
          </>
        );
      }

      // 技术服务商
      if (isServicer && !isSigned) {
        return (
          <>
            <div>
              <SpinBtn
                className="btn btn-primary btn-lg w-100"
                loading={signing}
                disabled={initialState?.processing}
                data-bs-toggle="modal"
                data-bs-target="signer-confirm"
              >
                技术服务商签名
              </SpinBtn>
            </div>

            <p className="mb-0">签名即同意募集计划中的约定，您签名后募集计划方可启动。</p>
          </>
        );
      }
    }

    // 待封装
    if (isSuccess && !isSealing && isRaiser) {
      return (
        <>
          <div>
            <SpinBtn className="btn btn-danger btn-lg w-100" loading={sealing} onClick={handleSeal}>
              提前启动封装
            </SpinBtn>
          </div>

          <p className="mb-0">募集已成功，可提前开始封装。募集金额将转入节点并开始计时。协调技术服务商，避免封装期违约。</p>
        </>
      );
    }

    return null;
  };

  // 封装结束
  if (!data || isFinished || isDestroyed) {
    return null;
  }

  return (
    <>
      <div id="card-action" className="card section-card">
        <div className="card-body d-flex flex-column gap-3">
          <div className="d-flex align-items-center">
            <h4 className="card-title mb-0 me-2">
              {isFailed
                ? '募集计划已结束'
                : isClosed
                ? '募集计划已关闭'
                : isRaising
                ? '正在募集中！距离截止时间'
                : isSuccess && !isSealing
                ? '募集成功，等待封装'
                : isSealing
                ? '封装倒计时'
                : isDelayed
                ? '封装延期'
                : '募集时间'}
            </h4>
            <div className="ms-auto">
              {isFailed ? <span className="badge badge-danger">募集未成功</span> : isSuccess ? <span className="badge badge-success">募集成功</span> : null}
            </div>
          </div>

          <div
            className={classNames('d-flex justify-content-between text-center lh-1', {
              'text-gray': isClosed || isFailed,
              'text-main': !isClosed && !isFailed,
            })}
          >
            <div className="">
              <p className="h2 fw-bold mb-1">{displayTime.days}</p>
              <p className="mb-0 text-gray">天</p>
            </div>
            <div className="">
              <p className="h2 fw-bold mb-1">{displayTime.hours}</p>
              <p className="mb-0 text-gray">小时</p>
            </div>
            <div className="">
              <p className="h2 fw-bold mb-1">{displayTime.minutes}</p>
              <p className="mb-0 text-gray">分</p>
            </div>
            <div className="">
              <p className="h2 fw-bold mb-1">{displayTime.seconds}</p>
              <p className="mb-0 text-gray">秒</p>
            </div>
          </div>

          {renderAction()}
        </div>
      </div>

      <Modal.Alert id="signer-confirm" footerClassName="border-0" title="移交Owner地址" confirmText="签名" confirmLoading={signing} onConfirm={handleSign}>
        <p className="mb-0 fs-16 fw-500">
          <span>在安全环境下执行以下命令，将Owner地址修改为智能合约地址。</span>
          <a className="text-underline" href="#">
            如何收回Owner地址？
          </a>
        </p>

        <div className="p-2 border rounded-1 my-4">
          <div className="d-flex bg-dark rounded-1 p-3">
            <span className="flex-shrink-0 text-white fw-600">$</span>
            <div className="flex-grow-1 mx-2 text-wrap">lotus-miner actor set-owner --really-do-it {data.raise_address} &lt;ownerAddress&gt;</div>
            <ShareBtn className="btn p-1" text={`lotus-miner actor set-owner --really-do-it ${data.raise_address} <ownerAddress>`}>
              <IconCopy />
            </ShareBtn>
          </div>
        </div>

        <p className="mb-0 fs-16 fw-500">执行成功后点击“签名”按钮。</p>
      </Modal.Alert>
    </>
  );
};

export default CardTimer;
