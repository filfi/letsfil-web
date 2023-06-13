import { Input } from 'antd';
import { useMemo } from 'react';
import classNames from 'classnames';

import * as F from '@/utils/format';
import Modal from '@/components/Modal';
import Avatar from '@/components/Avatar';
import SpinBtn from '@/components/SpinBtn';
import usePackInfo from '@/hooks/usePackInfo';
import useAssetPack from '@/hooks/useAssetPack';
import useRaiseBase from '@/hooks/useRaiseBase';
import useRaiseRate from '@/hooks/useRaiseRate';
import useRaiseRole from '@/hooks/useRaiseRole';
import useSProvider from '@/hooks/useSProvider';
import useRaiseState from '@/hooks/useRaiseState';
import useProcessing from '@/hooks/useProcessing';
import useDepositRaiser from '@/hooks/useDepositRaiser';
import useDepositServicer from '@/hooks/useDepositServicer';
import { accAdd, accDiv, accMul, accSub } from '@/utils/utils';
import { ReactComponent as IconDander } from '@/assets/icons/safe-danger.svg';
import { ReactComponent as IconSuccess } from '@/assets/icons/safe-success.svg';
import { ReactComponent as IconChecked } from '@/assets/icons/check-verified-02.svg';

const RaiserCard: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const [processing] = useProcessing();
  const { actual } = useRaiseBase(data);
  const { raiser, isRaiser, isRaisePaid } = useRaiseRole(data);
  const { isPending, isClosed, isFailed, isWaiting, isRaising, isSuccess, isWorking } = useRaiseState(data);
  const { amount, total, fines, paying, withdrawing, payAction, withdrawAction } = useDepositRaiser(data);

  const fee = useMemo(() => accMul(actual, 0.003), [actual]); // 手续费
  const payable = useMemo(() => isRaiser && isWaiting, [isRaiser, isWaiting]);
  const withdrawable = useMemo(() => isRaiser && (isClosed || isFailed || isWorking), [isRaiser, isClosed, isFailed, isWorking]);

  const renderExtra = () => {
    if (isClosed || isFailed) {
      <div className="bg-light my-2 px-3 py-2 rounded-3">
        <p className="d-flex gap-3 my-2">
          <span className="text-gray-dark">
            <span>累计罚金</span>
            <span className="ms-2 fw-bold text-danger">-{F.formatAmount(fines, 2, 2)}</span>
            <span className="ms-1">FIL</span>
          </span>
          {/* <a className="ms-auto text-underline" href="#">罚金明细</a> */}
        </p>
      </div>;
    }

    if (isSuccess) {
      return (
        <div className="bg-light my-2 px-3 py-2 rounded-3">
          <p className="d-flex gap-3 my-2">
            <span className="text-gray-dark">
              <span>集合质押手续费</span>
              <span className="ms-2 fw-bold text-danger">-{F.formatAmount(fee, 2, 2)}</span>
              <span className="ms-1">FIL</span>
            </span>
            {/* <a className="ms-auto text-underline" href="#">了解更多</a> */}
          </p>
          {isWorking && fines > 0 && (
            <p className="d-flex gap-3 my-2">
              <span className="text-gray-dark">
                <span>累计罚金</span>
                <span className="ms-2 fw-bold text-danger">-{F.formatAmount(fines, 2, 2)}</span>
                <span className="ms-1">FIL</span>
              </span>
              {/* <a className="ms-auto text-underline" href="#">罚金明细</a> */}
            </p>
          )}
        </div>
      );
    }
  };

  return (
    <>
      <div className={classNames('card mb-4', { 'card-danger': isRaiser && isWaiting && !isRaisePaid })}>
        <div className="card-header d-flex align-items-center">
          <div className="d-flex align-items-center me-auto">
            <div className="flex-shrink-0">{isRaisePaid ? <IconSuccess /> : <IconDander />}</div>
            <div className="flex-grow-1 ms-2">
              <h4 className="card-title fw-600 mb-0">主办人保证金</h4>
            </div>
          </div>

          {isRaisePaid ? (
            withdrawable ? (
              <SpinBtn
                className="btn btn-primary ms-auto"
                style={{ minWidth: 120 }}
                loading={withdrawing}
                disabled={amount <= 0 || processing}
                onClick={withdrawAction}
              >
                取回
              </SpinBtn>
            ) : (
              <IconChecked />
            )
          ) : payable ? (
            <SpinBtn className="btn btn-primary ms-auto" style={{ minWidth: 120 }} disabled={isPending || processing} loading={paying} onClick={payAction}>
              存入
            </SpinBtn>
          ) : null}
        </div>
        <div className="card-body">
          <div className="d-flex align-items-center mb-2">
            <p className="mb-0">
              <span className="text-decimal">{F.formatAmount(isRaisePaid ? amount : total)}</span>
              <span className="ms-1 text-gray">FIL</span>
            </p>
            {isRaisePaid && <span className="ms-auto badge badge-success">来自{F.formatAddr(raiser)}</span>}
          </div>
          {renderExtra()}
          <p className="mb-0">
            {isRaising ? (
              <span>当质押目标未达成，或主办人主动终止，此保证金赔偿建设者存入FIL的利息损失。</span>
            ) : (
              <span>保障集合质押期和封装期。质押目标未达成或封装延期，此保证金支付罚金。</span>
            )}
            {/* <a className="text-underline" href="#raiser-deposit" data-bs-toggle="modal">
              更多信息
            </a> */}
          </p>
        </div>
      </div>

      {/* <Modal.Alert id="raiser-deposit" title="主办人保证金">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">保障集合质押期和封装期。质押目标未达成或封装延期，此保证金支付罚金。</p>
          </div>
        </div>
      </Modal.Alert>

      <Modal.Alert id="sp-deposit" title="运维保证金">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">与建设者等比投入，维持占比{data?.ops_security_fund_rate}%。做为劣后质押封装到扇区，当发生网络罚金时，优先扣除该保证金。</p>
          </div>
        </div>
      </Modal.Alert> */}
    </>
  );
};

const ServicerCard: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const [processing] = useProcessing();
  const { actual } = useRaiseBase(data);
  const { data: pack } = usePackInfo(data);
  const provider = useSProvider(data?.service_id);
  const { investRate, opsRatio } = useRaiseRate(data);
  const { opsAmount, progress } = useAssetPack(data, pack);
  const { isOpsPaid, servicer, isServicer } = useRaiseRole(data);
  const { isPending, isWaiting, isClosed, isFailed, isSuccess, isWorking, isDestroyed } = useRaiseState(data);
  const { amount, fines, total, interest, paying, withdrawing, payAction, withdrawAction } = useDepositServicer(data);

  // 可存入
  const payable = useMemo(() => isServicer && isWaiting, [isServicer, isWaiting]);
  // 可取回
  const withdrawable = useMemo(() => isServicer && (isClosed || isFailed || isDestroyed), [isServicer, isClosed, isFailed, isDestroyed]);
  // 超配部分
  const opsOver = useMemo(() => Math.max(+F.toFixed(accSub(total, opsAmount), 2), 0), [total, opsAmount]);
  // 剩余部分
  const opsRemain = useMemo(() => Math.max(accSub(opsAmount, accMul(opsAmount, progress)), 0), [opsAmount, progress]);
  // 利息补偿
  const opsInterest = useMemo(() => accMul(interest, accDiv(total, accAdd(total, actual))), [total, interest, actual]);

  const renderExtra = () => {
    if ((isClosed || isFailed) && opsInterest) {
      return (
        <div className="bg-light my-2 px-3 py-2 rounded-3">
          {(isClosed || isFailed) && (
            <p className="d-flex gap-3 my-2">
              <span className="text-gray-dark">
                <span>利息补偿</span>
                <span className="ms-2 fw-bold text-success">+{F.formatAmount(opsInterest)}</span>
                <span className="ms-1">FIL</span>
              </span>
              {/* <a className="ms-auto text-underline" href="#">补偿明细</a> */}
            </p>
          )}
        </div>
      );
    }

    if (isSuccess && opsOver) {
      return (
        <div className="bg-light my-2 px-3 py-2 rounded-3">
          <p className="d-flex gap-3 my-2">
            <span className="text-gray-dark">
              <span>超配部分</span>
              <span className="ms-2 fw-bold">{F.formatAmount(opsOver)}</span>
              <span className="ms-1">FIL</span>
            </span>
            <span className="ms-auto">已退到 {F.formatAddr(servicer)}</span>
          </p>
        </div>
      );
    }

    if (isWorking && (opsRemain || fines)) {
      return (
        <div className="bg-light my-2 px-3 py-2 rounded-3">
          {opsRemain > 0 && (
            <p className="d-flex gap-3 my-2">
              <span className="text-gray-dark">
                <span>封装剩余部分</span>
                <span className="ms-2 fw-bold">{F.formatAmount(opsRemain, 2)}</span>
                <span className="ms-1">FIL</span>
              </span>
              {opsRemain > 0 && <span className="ms-auto">已退到 {F.formatAddr(servicer)}</span>}
            </p>
          )}
          {fines > 0 && (
            <p className="d-flex gap-3 my-2">
              <span className="text-gray-dark">
                <span>累计罚金</span>
                <span className="ms-2 fw-bold text-danger">-{F.formatAmount(fines, 2, 2)}</span>
                <span className="ms-1">FIL</span>
              </span>
              {/* <a className="ms-auto text-underline" href="#">罚金明细</a> */}
            </p>
          )}
        </div>
      );
    }
  };

  return (
    <>
      <div className={classNames('card', { 'card-danger': isServicer && isWaiting && !isOpsPaid })}>
        <div className="card-header d-flex align-items-center">
          <div className="d-flex align-items-center me-auto">
            <div className="flex-shrink-0">{isOpsPaid ? <IconSuccess /> : <IconDander />}</div>
            <div className="flex-grow-1 ms-2">
              <h4 className="card-title fw-600 mb-0">
                <span>运维保证金</span>
                {data && !isSuccess && <span>(预存)</span>}
              </h4>
            </div>
          </div>

          {isOpsPaid ? (
            withdrawable ? (
              <SpinBtn
                className="btn btn-primary ms-auto"
                style={{ minWidth: 120 }}
                loading={withdrawing}
                disabled={amount <= 0 || processing}
                onClick={withdrawAction}
              >
                取回
              </SpinBtn>
            ) : (
              <IconChecked />
            )
          ) : payable ? (
            <SpinBtn
              className="btn btn-primary ms-auto"
              style={{ minWidth: 120 }}
              loading={paying}
              disabled={isPending || processing}
              data-bs-toggle="modal"
              data-bs-target="#deposit-confirm"
            >
              存入
            </SpinBtn>
          ) : null}
        </div>
        <div className="card-body">
          <div className="d-flex align-items-center mb-2">
            <p className="mb-0">
              <span className="text-decimal">{F.formatAmount(isOpsPaid ? amount : total)}</span>
              <span className="ms-1 text-gray">FIL</span>
            </p>
            {isOpsPaid && <span className="ms-auto badge badge-success">来自{F.formatAddr(servicer)}</span>}
          </div>
          {renderExtra()}
          <p className="mb-0">
            <span>与建设者等比投入，保持占比{opsRatio}%。做为劣后质押封装到扇区，当发生网络罚金时，该保证金首先承担。</span>
            {/* <a className="text-underline" href="#sp-deposit" data-bs-toggle="modal">
              更多信息
            </a> */}
          </p>
        </div>
      </div>

      <Modal.Confirm id="deposit-confirm" footerClassName="border-0" title="预存运维保证金" confirmText="存入" confirmLoading={paying} onConfirm={payAction}>
        <div className="p-3">
          <p className="mb-4 fs-16 fw-500">
            <span>运维保证金做为劣后质押，与建设者的优先质押一同封装到存储节点中，分享网络激励。节点计划规定了如下质押比例。</span>
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
                      <span className="ms-2">{provider?.short_name}</span>
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
                      <span className="ms-2">建设者</span>
                    </div>
                  }
                  suffix="%"
                  value={investRate}
                />
              </div>
            </div>
          </div>

          <p className="mb-4 fs-16 fw-500">预存金额（基于质押目标计算配比金额，集合质押成功后返回超配部分）</p>

          <p className="mb-0">
            <span className="fs-24 fw-600">{F.formatAmount(total)}</span>
            <span className="ms-1 text-gray">FIL</span>
          </p>
        </div>
      </Modal.Confirm>
    </>
  );
};

const SectionDeposit: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  return (
    <>
      <RaiserCard data={data} />

      <ServicerCard data={data} />
    </>
  );
};

export default SectionDeposit;
