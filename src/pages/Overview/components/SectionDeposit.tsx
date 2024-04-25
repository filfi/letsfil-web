import { Input } from 'antd';
import { useMemo } from 'react';
import { parseEther } from 'viem';
import classNames from 'classnames';
import { useModel } from '@umijs/max';

import * as F from '@/utils/format';
import Modal from '@/components/Modal';
import Avatar from '@/components/Avatar';
import ModalDeposit from './ModalDeposit';
import SpinBtn from '@/components/SpinBtn';
import { safeAmount } from '@/constants/config';
import useContract from '@/hooks/useContract';
import useSProvider from '@/hooks/useSProvider';
import useProcessify from '@/hooks/useProcessify';
import useProcessing from '@/hooks/useProcessing';
import useDepositRaiser from '@/hooks/useDepositRaiser';
import useRaiseSyncCount from '@/hooks/useRaiseSyncCount';
import useDepositServicer from '@/hooks/useDepositServicer';
import { accAdd, accDiv, accMul, accSub } from '@/utils/utils';
import { ReactComponent as IconDander } from '@/assets/icons/safe-danger.svg';
import { ReactComponent as IconSuccess } from '@/assets/icons/safe-success.svg';
import { ReactComponent as IconChecked } from '@/assets/icons/check-verified-02.svg';

const RaiserCard: React.FC = () => {
  const [processing] = useProcessing();
  const { base, plan, role, state } = useModel('Overview.overview');

  const { actual } = base;
  const { raiser, isSuper, isRaisePaid } = role;
  const { isPending, isClosed, isFailed, isWaiting, isRaising, isSuccess, isWorking } = state;

  const { data: count } = useRaiseSyncCount(plan);
  const { amount, fines, total, paying, withdrawing, payAction, withdrawAction } = useDepositRaiser(plan);

  const fee = useMemo(() => accMul(actual, 0.003), [actual]); // 手续费
  const payable = useMemo(() => isSuper && isWaiting, [isSuper, isWaiting]);
  const withdrawable = useMemo(
    () => isSuper && (isClosed || isFailed || isWorking),
    [isSuper, isClosed, isFailed, isWorking],
  );
  const show = useMemo(
    () => isClosed || isFailed || (count?.seal_delay_sync_count ?? 0) > 0,
    [isClosed, isFailed, count?.seal_delay_sync_count],
  );

  const renderAction = () => {
    if (isRaisePaid) {
      // 已存入
      if (withdrawable && show) {
        // 可取回
        return (
          <SpinBtn
            className="btn btn-primary ms-auto"
            style={{ minWidth: 120 }}
            loading={withdrawing}
            disabled={amount <= 0 || processing}
            onClick={withdrawAction}
          >
            取回
          </SpinBtn>
        );
      }

      return <IconChecked />;
    }

    if (payable) {
      // 可存入
      return (
        <SpinBtn
          className="btn btn-primary ms-auto"
          style={{ minWidth: 120 }}
          loading={paying}
          disabled={isPending || processing}
          onClick={payAction}
        >
          存入
        </SpinBtn>
      );
    }

    return null;
  };

  const renderExtra = () => {
    if (isClosed || isFailed) {
      return (
        <div className="bg-light my-2 px-3 py-2 rounded-3">
          <p className="d-flex gap-3 my-2">
            <span className="text-gray-dark">
              <span>累計罰金</span>
              <span className="ms-2 fw-bold text-danger">-{F.formatAmount(fines, 2, 2)}</span>
              <span className="ms-1">FIL</span>
            </span>
            {/* <a className="ms-auto text-underline" href="#">罰金明細</a> */}
          </p>
        </div>
      );
    }

    if (isSuccess) {
      return (
        <div className="bg-light my-2 px-3 py-2 rounded-3">
          <p className="d-flex gap-3 my-2">
            <span className="text-gray-dark">
              <span>質押手續費</span>
              <span className="ms-2 fw-bold text-danger">-{F.formatAmount(fee, 2, 2)}</span>
              <span className="ms-1">FIL</span>
            </span>
            {/* <a className="ms-auto text-underline" href="#">了解更多</a> */}
          </p>
          {isWorking && fines > 0 && (
            <p className="d-flex gap-3 my-2">
              <span className="text-gray-dark">
                <span>累計罰金</span>
                <span className="ms-2 fw-bold text-danger">-{F.formatAmount(fines, 2, 2)}</span>
                <span className="ms-1">FIL</span>
              </span>
              {/* <a className="ms-auto text-underline" href="#">罰金明細</a> */}
            </p>
          )}
        </div>
      );
    }
  };

  return (
    <>
      <div className={classNames('card mb-4', { 'card-danger': isSuper && isWaiting && !isRaisePaid })}>
        <div className="card-header d-flex align-items-center">
          <div className="d-flex align-items-center me-auto">
            <div className="flex-shrink-0">{isRaisePaid ? <IconSuccess /> : <IconDander />}</div>
            <div className="flex-grow-1 ms-2">
              <h4 className="card-title fw-600 mb-0">主辦人保證金</h4>
            </div>
          </div>

          {renderAction()}
        </div>

        <div className="card-body">
          <div className="d-flex align-items-center mb-2">
            <p className="mb-0">
              <span className="text-decimal">{F.formatAmount(isRaisePaid ? amount : total)}</span>
              <span className="ms-1 text-gray">FIL</span>
            </p>
            {isRaisePaid && <span className="ms-auto badge badge-success">來自{F.formatAddr(raiser)}</span>}
          </div>

          {renderExtra()}

          <p className="mb-0">
            {isRaising ? (
              <span>當質押目標未達成，或主辦人主動終止，此保證金賠償建造者存入FIL的利息損失。</span>
            ) : (
              <span>保障質押期及封裝期。質押目標未達成或封裝延期，此保證金支付罰金。</span>
            )}
            {/* <a className="text-underline" href="#raiser-deposit" data-bs-toggle="modal">
              更多資訊
            </a> */}
          </p>
        </div>
      </div>
    </>
  );
};

const ServicerCard: React.FC = () => {
  const { assets, base, plan, role, state } = useModel('Overview.overview');

  const [processing] = useProcessing();
  const provider = useSProvider(plan?.service_id);
  const { fines, interest } = useDepositServicer(plan);
  const { addDepositOpsFund } = useContract(plan?.raise_address);

  const { actual, isProcessed } = base;
  const { isOpsPaid, servicer, isServicer } = role;
  const { opsAmount, sealProgress, opsAction } = assets;
  const { isPending, isWaiting, isStarted, isClosed, isFailed, isSuccess, isWorking, isDestroyed } = state;
  const { amount, need, safe, total, actual: opsActual, paying, withdrawing, payAction, withdrawAction } = opsAction;

  const after = useMemo(() => accAdd(amount, safe), [amount, safe]);
  const before = useMemo(() => accAdd(total, safeAmount), [safeAmount, total]);
  const opsRatio = useMemo(() => plan?.ops_security_fund_rate ?? 5, [plan]);
  const investRatio = useMemo(() => accSub(100, opsRatio), [opsRatio]);

  // 可存入
  const payable = useMemo(() => isServicer && isWaiting, [isServicer, isWaiting]);
  // 可取回
  const withdrawable = useMemo(
    () => isServicer && (isClosed || isFailed || isDestroyed),
    [isServicer, isClosed, isFailed, isDestroyed],
  );
  // 剩余部分 = 实际配比 - 实际配比 * 封装进度
  const opsRemain = useMemo(
    () => Math.max(accSub(opsAmount, accMul(opsAmount, sealProgress)), 0),
    [opsAmount, sealProgress],
  );
  // 超配部分 = 实际存入 - 实际配比
  const opsOver = useMemo(() => Math.max(+F.toFixed(accSub(opsActual, opsAmount), 2), 0), [opsActual, opsAmount]);
  // 利息补偿
  const opsInterest = useMemo(() => accMul(interest, accDiv(total, accAdd(total, actual))), [total, interest, actual]);

  const [adding, handleAddDeposit] = useProcessify(async () => {
    if (!isServicer || !plan?.raising_id) return;

    await addDepositOpsFund(plan?.raising_id, {
      value: parseEther(`${need}`),
    });
  });

  const renderAction = () => {
    if (isOpsPaid) {
      // 已存入
      if (withdrawable) {
        // 可取回
        return (
          <SpinBtn
            className="btn btn-primary ms-auto"
            style={{ minWidth: 120 }}
            loading={withdrawing}
            disabled={amount <= 0 || processing}
            onClick={withdrawAction}
          >
            取回
          </SpinBtn>
        );
      }

      if (isStarted && !isDestroyed && isServicer && need > 0) {
        // 需追加
        return (
          <SpinBtn
            className="btn btn-primary ms-auto"
            data-bs-toggle="modal"
            data-bs-target="#deposit-add"
            style={{ minWidth: 120 }}
            loading={adding}
          >
            追加
          </SpinBtn>
        );
      }

      return <IconChecked />;
    }

    if (payable) {
      // 可存入
      return (
        <SpinBtn
          className="btn btn-primary ms-auto"
          data-bs-toggle="modal"
          data-bs-target="#deposit-confirm"
          style={{ minWidth: 120 }}
          loading={paying}
          disabled={isPending || processing}
        >
          存入
        </SpinBtn>
      );
    }

    return null;
  };

  const renderExtra = () => {
    if ((isClosed || isFailed) && opsInterest) {
      return (
        <p className="d-flex gap-3 my-2">
          <span className="text-gray-dark">
            <span>利息補償</span>
            <span className="ms-2 fw-bold text-success">+{F.formatAmount(opsInterest)}</span>
            <span className="ms-1">FIL</span>
          </span>
          {/* <a className="ms-auto text-underline" href="#">補償明細</a> */}
        </p>
      );
    }

    if (isSuccess) {
      const hasFines = fines > 0;
      const hasOver = isWorking && opsOver > 0;
      const hasRemain = isWorking && opsRemain > 0;

      if ((isProcessed && (hasOver || hasRemain)) || hasFines) {
        return (
          <>
            {hasOver && isProcessed && (
              <p className="d-flex gap-3 my-2">
                <span className="text-gray-dark">
                  <span>超配部分</span>
                  <span className="ms-2 fw-bold">{F.formatAmount(opsOver)}</span>
                  <span className="ms-1">FIL</span>
                </span>
                <span className="ms-auto">已退到 {F.formatAddr(servicer)}</span>
              </p>
            )}
            {hasRemain && isProcessed && (
              <p className="d-flex gap-3 my-2">
                <span className="text-gray-dark">
                  <span>封裝剩餘部分</span>
                  <span className="ms-2 fw-bold">{F.formatAmount(opsRemain, 2)}</span>
                  <span className="ms-1">FIL</span>
                </span>
                {opsRemain > 0 && <span className="ms-auto">已退到 {F.formatAddr(servicer)}</span>}
              </p>
            )}
            {hasFines && (
              <p className="d-flex gap-3 my-2">
                <span className="text-gray-dark">
                  <span>累計罰金</span>
                  <span className="ms-2 fw-bold text-danger">-{F.formatAmount(fines, 2, 2)}</span>
                  <span className="ms-1">FIL</span>
                </span>
                {/* <a className="ms-auto text-underline" href="#">罰金明細</a> */}
              </p>
            )}
          </>
        );
      }
    }

    return null;
  };

  return (
    <>
      <div className={classNames('card', { 'card-danger': isServicer && isWaiting && !isOpsPaid })}>
        <div className="card-header d-flex align-items-center">
          <div className="d-flex align-items-center me-auto">
            <div className="flex-shrink-0">{isOpsPaid ? <IconSuccess /> : <IconDander />}</div>
            <div className="flex-grow-1 ms-2">
              <h4 className="card-title fw-600 mb-0">
                <span>運維保證金</span>
                {plan && !isSuccess && <span>(預存)</span>}
              </h4>
            </div>
          </div>

          {renderAction()}
        </div>
        <div className="card-body">
          <div className="d-flex align-items-center mb-2">
            <p className="mb-0">
              <span className="text-decimal">{F.formatAmount(isOpsPaid ? after : before)}</span>
              <span className="ms-1 text-gray">FIL</span>
            </p>
            {isOpsPaid && <span className="ms-auto badge badge-success">來自{F.formatAddr(servicer)}</span>}
          </div>

          <div className="bg-light my-2 px-3 py-2 rounded-3">
            <p className="d-flex gap-3 my-2">
              <span className="text-gray-dark">
                <span>運維保證金</span>
                <span className="ms-2 fw-bold">{F.formatAmount(isOpsPaid ? amount : total)}</span>
                <span className="ms-1">FIL</span>
              </span>
              <span className="ms-auto text-gray">跟隨節點生命週期</span>
            </p>
            <p className="d-flex gap-3 my-2">
              <span className="text-gray-dark">
                <span>封裝緩衝金</span>
                <span className="ms-2 fw-bold">{F.formatAmount(isOpsPaid ? safe : safeAmount)}</span>
                <span className="ms-1">FIL</span>
              </span>
              <span className="ms-auto text-gray">封裝完成後退還未使用部分</span>
            </p>

            {renderExtra()}
          </div>

          <p className="mb-0">
            <span>
              運維保證金與建設者等比投入，維持佔比{opsRatio}
              %，做為劣後質押封裝到扇區，當發生網路罰金時，該保證金首先承擔。封裝緩衝金固定為{safeAmount}
              FIL，用以補充封裝最後一個節點扇區。
            </span>
            {/* <a className="text-underline" href="#sp-deposit" data-bs-toggle="modal">
              更多信息
            </a> */}
          </p>
        </div>
      </div>

      <ModalDeposit id="deposit-add" amount={need} onConfirm={handleAddDeposit} />

      <Modal.Confirm
        id="deposit-confirm"
        title="預存運維保證金"
        confirmText="存入"
        confirmLoading={paying}
        onConfirm={payAction}
      >
        <div className="p-3">
          <p className="mb-4 fs-16 fw-500">
            <span>
              運維保證金做為劣後質押，與建設者的優先質押一同封裝到儲存節點中，分享網路激勵。節點計劃規定如下質押比例。
            </span>
            {/* <a className="text-underline" href="#">
              了解更多
            </a> */}
          </p>

          <div className="ffi-form">
            <div className="row row-cols-2 g-3">
              <div className="col ffi-item">
                <Input
                  readOnly
                  className="text-end bg-light"
                  size="large"
                  prefix={
                    <div className="d-flex algin-items-center">
                      <Avatar address={provider?.wallet_address} src={provider?.logo_url} size={24} />
                      <span className="ms-2">{provider?.short_name || F.formatAddr(provider?.wallet_address)}</span>
                    </div>
                  }
                  suffix="%"
                  value={opsRatio}
                />
              </div>
              <div className="col ffi-item">
                <Input
                  readOnly
                  className="text-end bg-light"
                  size="large"
                  prefix={
                    <div className="d-flex algin-items-center">
                      <span className="fs-24 lh-1 text-gray-dark">
                        <span className="bi bi-people"></span>
                      </span>
                      <span className="ms-2">建設者</span>
                    </div>
                  }
                  suffix="%"
                  value={investRatio}
                />
              </div>
            </div>
          </div>

          <p className="mb-4 fs-16 fw-500">預存金額（基於質押目標計算配比金額，質押成功後返回超配部分）</p>

          <p className="mb-0">
            <span className="fs-24 fw-600">{F.formatAmount(total)}</span>
            <span className="ms-1 text-gray">FIL</span>
          </p>
        </div>
      </Modal.Confirm>
    </>
  );
};

const SectionDeposit: React.FC = () => {
  return (
    <>
      <RaiserCard />

      <ServicerCard />
    </>
  );
};

export default SectionDeposit;
