import { parseEther } from 'viem';
import classNames from 'classnames';
import { useCountDown } from 'ahooks';
import { useModel } from '@umijs/max';
import { useEffect, useMemo, useState } from 'react';

import * as H from '@/helpers/app';
import Modal from '@/components/Modal';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import { isTargeted } from '@/helpers/raise';
import useContract from '@/hooks/useContract';
import useProcessify from '@/hooks/useProcessify';
import useProcessing from '@/hooks/useProcessing';
import useRaiseEquity from '@/hooks/useRaiseEquity';
import { day2sec, toF4Address } from '@/utils/utils';
import { formatAmount, formatPower, formatUnixDate } from '@/utils/format';
import { ReactComponent as IconCopy } from '@/assets/icons/copy-light.svg';

const formatTime = (mill: number) => {
  return {
    days: Math.floor(mill / 86400000),
    hours: Math.floor(mill / 3600000) % 24,
    minutes: Math.floor(mill / 60000) % 60,
    seconds: Math.floor(mill / 1000) % 60,
    milliseconds: Math.floor(mill) % 1000,
  };
};

const CardRaise: React.FC = () => {
  const [processing] = useProcessing();
  const { assets, plan, role, state } = useModel('Overview.overview');

  const contract = useContract(plan?.raise_address);
  const { sponsors } = useRaiseEquity(plan);
  const { sealedPower, sealedPledge } = assets;
  const { isSuper, isServicer, isSigned } = role;
  const {
    isPending,
    isWaiting,
    isRaising,
    isSuccess,
    isClosed,
    isFailed,
    isWaitSeal,
    isSealing,
    isDelayed,
    isWorking,
  } = state;

  const [targetDate, setTargetDate] = useState(0);
  const [, formatted] = useCountDown({ targetDate });

  const seconds = useMemo(() => {
    if (!plan) return 0;

    if (isClosed) {
      return plan.closing_time;
      // if (plan.begin_time && plan.closing_time) {
      //   return plan.closing_time - plan.begin_time;
      // }
    }

    if (isRaising || isWaitSeal) {
      return plan.closing_time;
    }

    if (isSealing) {
      return plan.end_seal_time;
    }

    if (isSuccess) {
      return day2sec(plan.seal_days);
    }

    return day2sec(plan.raise_days);
  }, [plan, isClosed, isRaising, isWaitSeal, isSealing, isSuccess]);
  const raiseTime = useMemo(() => formatTime(seconds * 1000), [seconds]);
  const displayTime = useMemo(
    () => (isRaising || isWaitSeal ? formatted : raiseTime),
    [formatted, raiseTime, isRaising, isWaitSeal],
  );

  useEffect(() => {
    if (isRaising || isWaitSeal || isSealing) {
      setTargetDate(seconds * 1000);
      return;
    }

    setTargetDate(0);
  }, [seconds, isRaising, isDelayed, isSealing]);

  const [creating, handleCreate] = useProcessify(async () => {
    if (!plan) return;

    const node = H.transformNodeInfo(plan);
    const raise = H.transformRaiseInfo(plan);

    const _sponsors = sponsors?.map((i) => i.address) ?? [];
    const sponsorsRates = sponsors?.map((i) => i.power_proportion) ?? [];

    // 定向计划
    if (isTargeted(plan)) {
      const whitelist = H.parseWhitelist(plan.raise_white_list);
      const _investors = whitelist.map((i) => i.address);
      const investorPledges = whitelist.map((i) => parseEther(`${Number(i.limit)}`));

      await contract.createPrivatePlan(
        raise,
        node,
        _sponsors,
        sponsorsRates,
        _investors,
        investorPledges,
        plan.begin_time,
      );
      return;
    }

    // 公开计划
    await contract.createPlan(raise, node, _sponsors, sponsorsRates, plan.begin_time);
  });

  const [signing, handleSign] = useProcessify(async () => {
    if (!plan) return;

    await contract.servicerSign();
  });

  const renderAction = () => {
    // 主办人
    if (isSuper) {
      // 准备中
      if (isPending) {
        return (
          <>
            <div>
              <SpinBtn className="btn btn-primary btn-lg w-100" loading={creating} onClick={handleCreate}>
                主辦人簽名
              </SpinBtn>
            </div>

            <p className="mb-0">與相關方共識後簽名，鏈上部署後不可修改。到達開放時間仍未簽名，計劃自動關閉。</p>
          </>
        );
      }
    }

    // 技术服务商
    if (isServicer) {
      // 准备中 | 待开始
      if (isPending || (isWaiting && !isSigned)) {
        return (
          <>
            <div>
              <SpinBtn
                className="btn btn-primary btn-lg w-100"
                loading={signing}
                disabled={isPending || processing}
                data-bs-toggle="modal"
                data-bs-target="#signer-confirm"
              >
                技術服務商簽名
              </SpinBtn>
            </div>

            {isPending ? (
              <p className="mb-0">等待主辦人簽名上鍊，上鍊後不可更改。之後技術服務商的簽名按鈕可用。</p>
            ) : (
              <p className="mb-0">簽名即同意計畫的內容，到達開放時間仍未簽名，計畫自動關閉。</p>
            )}
          </>
        );
      }
    }

    if (isPending || isWaiting) {
      return <p className="mb-0">節點計劃尚未開放，收藏頁面密切關注投資機會。</p>;
    }

    return null;
  };

  // 封装结束
  if (isWorking) {
    return (
      <>
        <div className="card section-card sticky-card">
          <div className="card-header d-flex align-items-center border-0">
            <h4 className="card-title fw-bold mb-0 me-2">建設完成</h4>
            <span className="badge badge-success ms-auto">質押成功</span>
            <span className="badge badge-success ms-2">封裝完成</span>
          </div>
          <div className="card-body py-2 fs-16 text-main">
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>新增算力(QAP)</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{formatPower(sealedPower)?.[0]}</span>
                <span className="ms-1 text-neutral">{formatPower(sealedPower)?.[1]}</span>
              </span>
            </p>
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>封裝質押</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{formatAmount(sealedPledge)}</span>
                <span className="ms-1 text-neutral">FIL</span>
              </span>
            </p>
            {/* <p className="d-flex align-items-center gap-3 mb-2">
              <span>剩餘金額</span>
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

  if (plan) {
    return (
      <>
        <div id="card-action" className="card section-card sticky-card">
          <div className="card-body d-flex flex-column gap-3">
            <div className="d-flex align-items-center flex-wrap gap-2">
              <h4 className="card-title fw-normal mb-0">
                {isFailed
                  ? '節點計劃已結束'
                  : isClosed
                  ? '節點計劃已關閉'
                  : isRaising
                  ? '距離截止還有'
                  : isWaitSeal
                  ? '質押成功'
                  : isSealing || isDelayed
                  ? '封裝截止時間'
                  : '開放時間'}
              </h4>
              <div className="ms-auto">
                {isFailed ? (
                  <span className="badge badge-danger">計劃啟動失敗</span>
                ) : isSuccess ? (
                  <span className="badge badge-success">質押成功</span>
                ) : null}
                {isDelayed ? (
                  <span className="badge badge-warning ms-2">封裝延期</span>
                ) : isSealing ? (
                  <span className="badge badge-primary ms-2">正在封裝</span>
                ) : null}
              </div>
            </div>

            {isPending || isWaiting || isClosed ? (
              <p className="countdown-text mb-0">{formatUnixDate(plan.begin_time)}</p>
            ) : isSuccess && (isDelayed || isSealing) ? (
              <p className="countdown-text mb-0">{formatUnixDate(plan.end_seal_time)}</p>
            ) : (
              <div
                className={classNames('d-flex justify-content-between text-center lh-1', {
                  'text-gray': isClosed || isFailed,
                  'text-main': !isClosed && !isFailed,
                })}
              >
                <div className="countdown-item">
                  <p className="fs-36 fw-bold mb-1">{displayTime.days}</p>
                  <p className="mb-0 text-gray">天</p>
                </div>
                <div className="countdown-item">
                  <p className="fs-36 fw-bold mb-1">{displayTime.hours}</p>
                  <p className="mb-0 text-gray">小時</p>
                </div>
                <div className="countdown-item">
                  <p className="fs-36 fw-bold mb-1">{displayTime.minutes}</p>
                  <p className="mb-0 text-gray">分</p>
                </div>
                <div className="countdown-item">
                  <p className="fs-36 fw-bold mb-1">{displayTime.seconds}</p>
                  <p className="mb-0 text-gray">秒</p>
                </div>
              </div>
            )}

            {renderAction()}
          </div>
        </div>

        <Modal.Alert
          id="signer-confirm"
          footerClassName="border-0"
          title="移交Owner地址"
          confirmText="簽名"
          confirmLoading={signing}
          onConfirm={handleSign}
        >
          <div className="p-3">
            <p className="mb-0 fs-16 fw-500">
              <span>在安全環境下執行以下命令，將Owner位址修改為智慧合約位址。</span>
              {/* <a className="text-underline" href="#">
                如何收回Owner地址？
              </a> */}
            </p>

            <div className="p-2 border rounded-1 my-4">
              <div className="d-flex align-items-start bg-dark rounded-1 p-2">
                <span className="flex-shrink-0 text-white fw-600">$</span>
                <div className="flex-grow-1 mx-2 fw-600 text-wrap text-success">
                  lotus-miner actor set-owner --really-do-it {toF4Address(plan.raise_address)} &lt;ownerAddress&gt;
                </div>
                <ShareBtn
                  className="btn p-0"
                  text={`lotus-miner actor set-owner --really-do-it ${toF4Address(plan.raise_address)} <ownerAddress>`}
                >
                  <IconCopy />
                </ShareBtn>
              </div>
            </div>

            <p className="mb-0 fs-16 fw-500">執行成功後點選“簽名”按鈕。</p>
          </div>
        </Modal.Alert>
      </>
    );
  }

  return null;
};

export default CardRaise;
