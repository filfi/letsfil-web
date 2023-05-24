import { useMemo } from 'react';
import classNames from 'classnames';
import { Avatar, Input } from 'antd';
import { useModel } from '@umijs/max';

import Modal from '@/components/Modal';
import SpinBtn from '@/components/SpinBtn';
import useProvider from '@/hooks/useProvider';
import { RaiseState } from '@/constants/state';
import useProcessify from '@/hooks/useProcessify';
import useRaiseState from '@/hooks/useRaiseState';
import { formatAddr, formatEther } from '@/utils/format';
import { ReactComponent as IconDander } from '@/assets/icons/safe-danger.svg';
import { ReactComponent as IconSuccess } from '@/assets/icons/safe-success.svg';
import { ReactComponent as IconChecked } from '@/assets/icons/check-verified-02.svg';
import { accSub } from '@/utils/utils';

const SectionDeposit: React.FC<{ data?: API.Plan }> = ({ data }) => {
  const { getProvider } = useProvider();
  const { initialState } = useModel('@@initialState');
  const { contract, isOpsPaid, isPending, isRaising, isRaisePaid, isRaiser, isServicer, raiseState, raiser, servicer } = useRaiseState(data);

  const provider = useMemo(() => getProvider?.(data?.service_id), [data?.service_id, getProvider]);
  const opsPayable = useMemo(() => isServicer && raiseState < RaiseState.Raising, [isServicer, raiseState]);
  const raiserPayable = useMemo(() => isRaiser && raiseState < RaiseState.Raising, [isRaiser, raiseState]);
  const investRate = useMemo(() => (data?.ops_security_fund_rate ? Math.max(accSub(100, data.ops_security_fund_rate), 0) : 0), [data?.ops_security_fund_rate]);

  const [raising, handleRaisePay] = useProcessify(async () => {
    if (!data) return;

    await contract.depositRaiseFund(data.raising_id, {
      value: data.raise_security_fund,
    });
  });

  const [opsLoading, handleOpsPay] = useProcessify(async () => {
    if (!data) return;

    await contract.depositOpsFund(data.raising_id, {
      value: data.ops_security_fund,
    });
  });

  return (
    <>
      <div className={classNames('card mb-4', { 'card-danger': data && !isPending && !isRaisePaid })}>
        <div className="card-header d-flex align-items-center">
          <div className="d-flex align-items-center me-auto">
            <div className="flex-shrink-0">{data && !isPending && !isRaisePaid ? <IconDander /> : <IconSuccess />}</div>
            <div className="flex-grow-1 ms-2">
              <h4 className="card-title fw-600 mb-0">发起人保证金</h4>
            </div>
          </div>

          {isRaisePaid ? (
            <IconChecked />
          ) : raiserPayable ? (
            <SpinBtn className="btn btn-primary ms-auto" style={{ minWidth: 120 }} disabled={isPending} loading={raising} onClick={handleRaisePay}>
              存入
            </SpinBtn>
          ) : null}
        </div>
        <div className="card-body">
          <div className="d-flex align-items-center mb-1">
            <p className="mb-0">
              <span className="text-decimal">{formatEther(data?.raise_security_fund)}</span>
              <span className="ms-1 text-gray">FIL</span>
            </p>
            {isRaisePaid && <span className="ms-auto badge badge-success">来自{formatAddr(raiser)}</span>}
          </div>
          <p className="mb-0">
            {isRaising ? (
              <span>当募集目标未达成，或发起方主动终止，此保证金赔偿投资人存入FIL的利息损失。</span>
            ) : (
              <span>保障募集期和封装期。募集目标未达成或封装延期，此保证金支付罚金。</span>
            )}
            <a className="text-underline" href="#raiser-deposit" data-bs-toggle="modal">
              更多信息
            </a>
          </p>
        </div>
      </div>

      <div className={classNames('card', { 'card-danger': data && !isPending && !isOpsPaid })}>
        <div className="card-header d-flex align-items-center">
          <div className="d-flex align-items-center me-auto">
            <div className="flex-shrink-0">{data && !isPending && !isOpsPaid ? <IconDander /> : <IconSuccess />}</div>
            <div className="flex-grow-1 ms-2">
              <h4 className="card-title fw-600 mb-0">技术运维保证金(预存)</h4>
            </div>
          </div>

          {isOpsPaid ? (
            <IconChecked />
          ) : opsPayable ? (
            <SpinBtn
              className="btn btn-primary ms-auto"
              style={{ minWidth: 120 }}
              loading={opsLoading}
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
              <span className="text-decimal">{formatEther(data?.ops_security_fund)}</span>
              <span className="ms-1 text-gray">FIL</span>
            </p>
            {isOpsPaid && <span className="ms-auto badge badge-success">来自{formatAddr(servicer)}</span>}
          </div>
          <p className="mb-0">
            <span>与投资人等比投入，维持占比{data?.ops_security_fund_rate}%。做为劣后质押币封装到扇区，当发生网络罚金时，优先扣除该保证金。</span>
            <a className="text-underline" href="#sp-deposit" data-bs-toggle="modal">
              更多信息
            </a>
          </p>
        </div>
      </div>

      <Modal.Confirm
        id="deposit-confirm"
        footerClassName="border-0"
        title="预存技术运维保证金"
        confirmText="存入"
        confirmLoading={opsLoading}
        onConfirm={handleOpsPay}
      >
        <div className="p-3">
          <p className="mb-4 fs-16 fw-500">
            <span>技术运维保证金认购募集计划的份额，成为劣后质押币，与投资人的优先质押一同封装到存储节点中。</span>
            <a className="text-underline" href="#">
              了解更多
            </a>
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
                  value={data?.ops_security_fund_rate}
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

          <p className="mb-4 fs-16 fw-500">预存金额按照募集目标计算，募集结束后按照实际募集目标</p>

          <p className="mb-0">
            <span className="fs-24 fw-600">{formatEther(data?.ops_security_fund)}</span>
            <span className="ms-1 text-gray">FIL</span>
          </p>
        </div>
      </Modal.Confirm>

      <Modal.Alert id="raiser-deposit" title="发起人保证金">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">保障募集期和封装期。募集目标未达成或封装延期，此保证金支付罚金。</p>
          </div>
        </div>
      </Modal.Alert>

      <Modal.Alert id="sp-deposit" title="技术运维保证金">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">与投资人等比投入，维持占比{data?.ops_security_fund_rate}%。做为劣后质押币封装到扇区，当发生网络罚金时，优先扣除该保证金。</p>
          </div>
        </div>
      </Modal.Alert>
    </>
  );
};

export default SectionDeposit;
