import { useMemo } from 'react';
import classNames from 'classnames';
import { Avatar, Input } from 'antd';
import { useModel } from '@umijs/max';

import * as F from '@/utils/format';
import Modal from '@/components/Modal';
import SpinBtn from '@/components/SpinBtn';
import useRaiseInfo from '@/hooks/useRaiseInfo';
import useRaiseRate from '@/hooks/useRaiseRate';
import useRaiseState from '@/hooks/useRaiseState';
import { accAdd, accDiv, accMul } from '@/utils/utils';
import useDepositRaiser from '@/hooks/useDepositRaiser';
import useDepositServicer from '@/hooks/useDepositServicer';
import { ReactComponent as IconDander } from '@/assets/icons/safe-danger.svg';
import { ReactComponent as IconSuccess } from '@/assets/icons/safe-success.svg';
import { ReactComponent as IconChecked } from '@/assets/icons/check-verified-02.svg';
import type { ItemProps } from './types';

const RaiserCard: React.FC<ItemProps> = ({ data }) => {
  const { initialState } = useModel('@@initialState');

  const { actual, raiser, isRaiser, isRaisePaid } = useRaiseInfo(data);
  const { amount, total, fines, paying, processing, pay, withdraw } = useDepositRaiser(data);
  const { isPending, isClosed, isFailed, isWaiting, isRaising, isSuccess, isWorking } = useRaiseState(data);

  const fee = useMemo(() => accMul(actual, 0.003), [actual]); // 手续费
  const payable = useMemo(() => isRaiser && isWaiting, [isRaiser, isWaiting]);
  const withdrawable = useMemo(() => isRaiser && (isClosed || isFailed || isWorking), [isRaiser, isClosed, isFailed, isWorking]);

  return (
    <>
      <div className={classNames('card mb-4', { 'card-danger': isRaiser && isWaiting && !isRaisePaid })}>
        <div className="card-header d-flex align-items-center">
          <div className="d-flex align-items-center me-auto">
            <div className="flex-shrink-0">{isRaisePaid ? <IconSuccess /> : <IconDander />}</div>
            <div className="flex-grow-1 ms-2">
              <h4 className="card-title fw-600 mb-0">发起人保证金</h4>
            </div>
          </div>

          {isRaisePaid ? (
            withdrawable ? (
              <SpinBtn
                className="btn btn-primary ms-auto"
                style={{ minWidth: 120 }}
                loading={processing}
                disabled={amount <= 0 || initialState?.processing}
                onClick={withdraw}
              >
                取回
              </SpinBtn>
            ) : (
              <IconChecked />
            )
          ) : payable ? (
            <SpinBtn className="btn btn-primary ms-auto" style={{ minWidth: 120 }} disabled={isPending} loading={paying} onClick={pay}>
              存入
            </SpinBtn>
          ) : null}
        </div>
        <div className="card-body">
          <div className="d-flex align-items-center mb-1">
            <p className="mb-0">
              <span className="text-decimal">{F.formatAmount(isRaisePaid ? amount : total)}</span>
              <span className="ms-1 text-gray">FIL</span>
            </p>
            {isRaisePaid && <span className="ms-auto badge badge-success">来自{F.formatAddr(raiser)}</span>}
          </div>
          {(isClosed || isFailed || isSuccess || isWorking) && (
            <div className="bg-light my-2 px-3 py-2 rounded-3">
              {isSuccess && (
                <p className="d-flex gap-3 my-2">
                  <span className="text-gray-dark">
                    <span>募集手续费</span>
                    <span className="ms-2 fw-bold text-danger">-{F.formatAmount(fee, 2, 2)}</span>
                    <span className="ms-1">FIL</span>
                  </span>
                  {/* <a className="ms-auto text-underline" href="#">了解更多</a> */}
                </p>
              )}
              {(isClosed || isFailed || isWorking) && (
                <p className="d-flex gap-3 my-2">
                  <span className="text-gray-dark">
                    <span>累计罚息</span>
                    <span className="ms-2 fw-bold text-danger">-{F.formatAmount(fines, 2, 2)}</span>
                    <span className="ms-1">FIL</span>
                  </span>
                  {/* <a className="ms-auto text-underline" href="#">罚金明细</a> */}
                </p>
              )}
            </div>
          )}
          <p className="mb-0">
            {isRaising ? (
              <span>当节点目标未达成，或发起方主动终止，此保证金赔偿投资人存入FIL的利息损失。</span>
            ) : (
              <span>保障募集期和封装期。节点目标未达成或封装延期，此保证金支付罚金。</span>
            )}
            {/* <a className="text-underline" href="#raiser-deposit" data-bs-toggle="modal">
              更多信息
            </a> */}
          </p>
        </div>
      </div>

      {/* <Modal.Alert id="raiser-deposit" title="发起人保证金">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">保障募集期和封装期。节点目标未达成或封装延期，此保证金支付罚金。</p>
          </div>
        </div>
      </Modal.Alert>

      <Modal.Alert id="sp-deposit" title="技术运维保证金">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">与投资人等比投入，维持占比{data?.ops_security_fund_rate}%。做为劣后质押币封装到扇区，当发生网络罚金时，优先扣除该保证金。</p>
          </div>
        </div>
      </Modal.Alert> */}
    </>
  );
};

const ServiceCard: React.FC<ItemProps> = ({ data, getProvider }) => {
  const { initialState } = useModel('@@initialState');
  const { investRate, opsRatio } = useRaiseRate(data);
  const { actual, isOpsPaid, servicer, isServicer } = useRaiseInfo(data);
  const { isPending, isWaiting, isClosed, isFailed, isSuccess, isWorking, isDestroyed } = useRaiseState(data);
  const { amount, fines, over, remain, total, totalInterest, paying, processing, pay, withdraw } = useDepositServicer(data);

  const payable = useMemo(() => isServicer && isWaiting, [isServicer, isWaiting]);
  const provider = useMemo(() => getProvider?.(data?.service_id), [data?.service_id, getProvider]);
  const withdrawable = useMemo(() => isServicer && (isClosed || isFailed || isDestroyed), [isServicer, isClosed, isFailed, isDestroyed]);
  const opsInterest = useMemo(() => accMul(totalInterest, accDiv(total, accAdd(total, actual))), [total, totalInterest, actual]); // 利息补偿
  const showExtra = useMemo(() => isClosed || isFailed || isSuccess || isWorking || fines > 0, [isClosed, isFailed, isSuccess, isWorking, fines]);

  return (
    <>
      <div className={classNames('card', { 'card-danger': isServicer && isWaiting && !isOpsPaid })}>
        <div className="card-header d-flex align-items-center">
          <div className="d-flex align-items-center me-auto">
            <div className="flex-shrink-0">{isOpsPaid ? <IconSuccess /> : <IconDander />}</div>
            <div className="flex-grow-1 ms-2">
              <h4 className="card-title fw-600 mb-0">技术运维保证金(预存)</h4>
            </div>
          </div>

          {isOpsPaid ? (
            withdrawable ? (
              <SpinBtn
                className="btn btn-primary ms-auto"
                style={{ minWidth: 120 }}
                loading={processing}
                disabled={amount <= 0 || initialState?.processing}
                onClick={withdraw}
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
              disabled={initialState?.processing || isPending}
              data-bs-toggle="modal"
              data-bs-target="#deposit-confirm"
            >
              存入
            </SpinBtn>
          ) : null}
        </div>
        <div className="card-body">
          <div className="d-flex align-items-center mb-1">
            <p className="mb-0">
              <span className="text-decimal">{F.formatAmount(isOpsPaid ? amount : total)}</span>
              <span className="ms-1 text-gray">FIL</span>
            </p>
            {isOpsPaid && <span className="ms-auto badge badge-success">来自{F.formatAddr(servicer)}</span>}
          </div>
          {showExtra && (
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
              {isSuccess && (
                <p className="d-flex gap-3 my-2">
                  <span className="text-gray-dark">
                    <span>超配部分</span>
                    <span className="ms-2 fw-bold">{F.formatAmount(over)}</span>
                    <span className="ms-1">FIL</span>
                  </span>
                  {over > 0 && <span className="ms-auto">已退到 {F.formatAddr(servicer)}</span>}
                </p>
              )}
              {isWorking && (
                <p className="d-flex gap-3 my-2">
                  <span className="text-gray-dark">
                    <span>封装剩余部分</span>
                    <span className="ms-2 fw-bold">{F.formatAmount(remain)}</span>
                    <span className="ms-1">FIL</span>
                  </span>
                  {remain > 0 && <span className="ms-auto">已退到 {F.formatAddr(servicer)}</span>}
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
          )}
          <p className="mb-0">
            <span>与投资人等比投入，维持占比{opsRatio}%。做为劣后质押币封装到扇区，当发生网络罚金时，优先扣除该保证金。</span>
            {/* <a className="text-underline" href="#sp-deposit" data-bs-toggle="modal">
              更多信息
            </a> */}
          </p>
        </div>
      </div>

      <Modal.Confirm id="deposit-confirm" footerClassName="border-0" title="预存技术运维保证金" confirmText="存入" confirmLoading={paying} onConfirm={pay}>
        <div className="p-3">
          <p className="mb-4 fs-16 fw-500">
            <span>技术运维保证金认购募集计划的份额，成为劣后质押币，与投资人的优先质押一同封装到存储节点中。</span>
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
                      <Avatar src={provider?.logo_url} size={24} />
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
                      <span className="ms-2">投资人</span>
                    </div>
                  }
                  suffix="%"
                  value={investRate}
                />
              </div>
            </div>
          </div>

          <p className="mb-4 fs-16 fw-500">预存金额按照节点目标计算，募集结束后按照实际节点目标</p>

          <p className="mb-0">
            <span className="fs-24 fw-600">{F.formatAmount(total)}</span>
            <span className="ms-1 text-gray">FIL</span>
          </p>
        </div>
      </Modal.Confirm>
    </>
  );
};

const SectionDeposit: React.FC<ItemProps> = (props) => {
  return (
    <>
      <RaiserCard {...props} />

      <ServiceCard {...props} />
    </>
  );
};

export default SectionDeposit;
