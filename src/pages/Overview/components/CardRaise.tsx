import { parseEther } from 'viem';
import classNames from 'classnames';
import { useCountDown } from 'ahooks';
import { useEffect, useMemo, useState } from 'react';

import * as H from '@/helpers/app';
import Modal from '@/components/Modal';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import { isTargeted } from '@/helpers/raise';
import useContract from '@/hooks/useContract';
import usePackInfo from '@/hooks/usePackInfo';
import useAssetPack from '@/hooks/useAssetPack';
import useRaiseRole from '@/hooks/useRaiseRole';
import useRaiseState from '@/hooks/useRaiseState';
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

const CardRaise: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const [processing] = useProcessing();
  const { data: pack } = usePackInfo(data);
  const contract = useContract(data?.raise_address);
  const { sponsors } = useRaiseEquity(data);
  const { power, pledge } = useAssetPack(data, pack);
  const { isRaiser, isServicer, isSigned } = useRaiseRole(data);
  const { isPending, isWaiting, isRaising, isSuccess, isClosed, isFailed, isWaitSeal, isSealing, isDelayed, isWorking } = useRaiseState(data);

  const [targetDate, setTargetDate] = useState(0);
  const [, formatted] = useCountDown({ targetDate });

  const seconds = useMemo(() => {
    if (!data) return 0;

    if (isClosed) {
      if (data.begin_time && data.closing_time) {
        return data.closing_time - data.begin_time;
      }
    }

    if (isRaising || isWaitSeal) {
      return data.closing_time;
    }

    if (isSealing) {
      return data.end_seal_time;
    }

    if (isSuccess) {
      return day2sec(data.seal_days);
    }

    return day2sec(data.raise_days);
  }, [data, isClosed, isRaising, isWaitSeal, isSealing, isSuccess]);
  const raiseTime = useMemo(() => formatTime(seconds * 1000), [seconds]);
  const displayTime = useMemo(() => (isRaising || isWaitSeal ? formatted : raiseTime), [formatted, raiseTime, isRaising, isWaitSeal]);

  useEffect(() => {
    if (isRaising || isWaitSeal || isSealing) {
      setTargetDate(seconds * 1000);
      return;
    }

    setTargetDate(0);
  }, [seconds, isRaising, isDelayed, isSealing]);

  const [creating, handleCreate] = useProcessify(async () => {
    if (!data) return;

    const node = H.transformNodeInfo(data);
    const raise = H.transformRaiseInfo(data);

    const _sponsors = sponsors?.map((i) => i.address) ?? [];
    const sponsorsRates = sponsors?.map((i) => i.power_proportion) ?? [];

    // 定向计划
    if (isTargeted(data)) {
      const whitelist = H.parseWhitelist(data.raise_white_list);
      const _investors = whitelist.map((i) => i.address);
      const investorPledges = whitelist.map((i) => parseEther(`${Number(i.limit)}`));

      await contract.createPrivatePlan(raise, node, _sponsors, sponsorsRates, _investors, investorPledges, data.begin_time);
      return;
    }

    // 公开计划
    await contract.createPlan(raise, node, _sponsors, sponsorsRates, data.begin_time);
  });

  const [signing, handleSign] = useProcessify(async () => {
    if (!data) return;

    await contract.servicerSign();
  });

  const renderAction = () => {
    // 主办人
    if (isRaiser) {
      // 准备中
      if (isPending) {
        return (
          <>
            <div>
              <SpinBtn className="btn btn-primary btn-lg w-100" loading={creating} onClick={handleCreate}>
                主办人签名
              </SpinBtn>
            </div>

            <p className="mb-0">与相关方共识后签名，链上部署后不可修改。到达开放时间仍未签名，计划自动关闭。</p>
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
                技术服务商签名
              </SpinBtn>
            </div>

            {isPending ? (
              <p className="mb-0">等待主办人签名上链，上链后不可更改。之后技术服务商的签名按钮可用。</p>
            ) : (
              <p className="mb-0">签名即同意计划的内容，到达开放时间仍未签名，计划自动关闭。</p>
            )}
          </>
        );
      }
    }

    return <p className="mb-0">节点计划尚未开放，收藏页面密切关注投资机会。</p>;
  };

  // 封装结束
  if (isWorking) {
    return (
      <>
        <div className="card section-card">
          <div className="card-header d-flex align-items-center border-0">
            <h4 className="card-title fw-bold mb-0 me-2">建设完成</h4>
            <span className="badge badge-success ms-auto">质押成功</span>
            <span className="badge badge-success ms-2">封装完成</span>
          </div>
          <div className="card-body py-2 fs-16 text-main">
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>新增算力(QAP)</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{formatPower(power)?.[0]}</span>
                <span className="ms-1 text-neutral">{formatPower(power)?.[1]}</span>
              </span>
            </p>
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>封装质押</span>
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
              <h4 className="card-title fw-normal mb-0">
                {isFailed
                  ? '节点计划已结束'
                  : isClosed
                  ? '节点计划已关闭'
                  : isRaising
                  ? '距离截止还有'
                  : isWaitSeal
                  ? '质押成功'
                  : isSealing || isDelayed
                  ? '封装截止时间'
                  : '开放时间'}
              </h4>
              <div className="ms-auto">
                {isFailed ? <span className="badge badge-danger">计划启动失败</span> : isSuccess ? <span className="badge badge-success">质押成功</span> : null}
                {isDelayed ? (
                  <span className="badge badge-warning ms-2">封装延期</span>
                ) : isSealing ? (
                  <span className="badge badge-primary ms-2">正在封装</span>
                ) : null}
              </div>
            </div>

            {isPending || isWaiting ? (
              <p className="countdown-text mb-0">{formatUnixDate(data.begin_time)}</p>
            ) : isSuccess && (isDelayed || isSealing) ? (
              <p className="countdown-text mb-0">{formatUnixDate(data.end_seal_time)}</p>
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
                  <p className="mb-0 text-gray">小时</p>
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
