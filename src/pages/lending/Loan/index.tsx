import { Form } from 'antd';
import { parseEther } from 'viem';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, history, useModel } from '@umijs/max';
import { useDebounceEffect, useMount, useUnmount, useUpdateEffect } from 'ahooks';

import { getInfo } from '@/apis/raise';
import Manual from './components/Manual';
import Slider from './components/Slider';
import Dialog from '@/components/Dialog';
import SpinBtn from '@/components/SpinBtn';
import LoanRadio from '../components/LoanRadio';
import { withNull } from '@/utils/hackify';
import useAccount from '@/hooks/useAccount';
import useContract from '@/hooks/useContract';
import useLoanPool from '@/hooks/useLoanPool';
import useLoanAsset from '@/hooks/useLoanAsset';
import useRaiseInfo from '@/hooks/useRaiseInfo';
import useProcessify from '@/hooks/useProcessify';
import useLoanContract from '@/hooks/useLoanContract';
import useRetrieverContract from '@/hooks/useRetrieverContract';
import { accDiv, accMul, accSub, isEqual } from '@/utils/utils';
import { formatAmount, formatID, formatNum, formatRate, toFixed, toNumber } from '@/utils/format';

export default function LendingLoan() {
  const [form] = Form.useForm();
  const { address } = useAccount();
  const [model, setModel] = useModel('loanform');
  const amount = Form.useWatch('amount', form);
  const percent = Form.useWatch('percent', form);

  const C = useContract();
  const pool = useLoanPool();
  const loan = useLoanContract();
  const contract = useRetrieverContract();

  const [manual, setManual] = useState(false);
  const { data: plan } = useRaiseInfo(model?.assetId);
  const { pledge, collateral, rate: pledgeRate, isLoading } = useLoanAsset(model?.assetId);

  const getUnpaidLoan = async () => {
    if (address && model?.assetId) {
      return await contract.getUnpaidLoan(model.assetId, address);
    }
  };

  const { data: debt } = useQuery(['getUnpaidLoan', model?.assetId, address], withNull(getUnpaidLoan));

  const sliderMax = useMemo(() => accMul(pledge, 2), [pledge]);
  const available = useMemo(() => accMul(model?.loanAvaialable ?? 0, 2), [model?.loanAvaialable]);
  const max = useMemo(() => Number(toFixed(available, 4)), [available]);
  const pRate = useMemo(() => (Number.isNaN(+percent) ? 0 : Number(percent)), [percent]);
  const loanRate = useMemo(() => (sliderMax > 0 ? accMul(accDiv(debt ?? 0, sliderMax), 100) : 0), [debt, sliderMax]);
  const sliderRate = useMemo(() => Math.max(accSub(pRate, loanRate), 0), [loanRate, pRate]);

  const current = useMemo(() => {
    if (manual) {
      const val = +amount;
      return Number.isNaN(val) ? 0 : val;
    }

    return accMul(sliderMax, accDiv(sliderRate, 100));
  }, [amount, manual, sliderMax, sliderRate]);
  const remain = useMemo(() => Math.max(accSub(max, current), 0), [max, current]);
  // const weekly = useMemo(() => accMul(current, accMul(accDiv(pool.loanRate, 365), 7)), [current, pool.loanRate]);
  const disabled = useMemo(() => current <= 0 || (!manual && pRate < pledgeRate), [current, manual, pRate, pledgeRate]);

  const onTabChange = (e: Event) => {
    const el = e.target as HTMLAnchorElement;
    const target = el.getAttribute('href')?.substring(1);

    setManual(target === 'manual');
  };

  const bindEvents = () => {
    const ul = document.querySelector('.nav-tabs[role="tablist"]');
    ul?.addEventListener('shown.bs.tab', onTabChange);
  };

  const unBindEvents = () => {
    const ul = document.querySelector('.nav-tabs[role="tablist"]');
    ul?.removeEventListener('shown.bs.tab', onTabChange);
  };

  const handleSuspend = () => {
    Dialog.alert({
      modal: true,
      closable: false,
      title: '錢包地址已變更',
      summary: '由於錢包位址變更，當前流程將中止',
      confirmText: '知道了',
      onConfirm: () => {
        history.replace('/');
      },
    });
  };

  const getRaiseMax = async (id: string) => {
    const info = await getInfo(id);
    const pledge = await C.getTotalPledge(id, info.raise_address);
    const target = toNumber(info.target_amount);
    const actual = pledge ?? toNumber(info.actual_amount);
    return Math.min(Math.max(accSub(target, actual), 0), 5_000_000);
  };

  const validateAsset = async () => {
    if (current > pool.available) {
      Dialog.alert({
        title: '借款金額超過建設池可藉數',
        summary: `建設池中最多還可藉 ${formatAmount(pool.available, 0)} FIL`,
      });
      return false;
    }

    if (!model?.raiseId) return false;

    const max = await getRaiseMax(model.raiseId);

    if (current > max) {
      Dialog.alert({
        title: '質押金額超過目前計畫限額',
        summary: `目前計劃最高還可質押 ${formatAmount(max)} FIL`,
      });
      return false;
    }

    return true;
  };

  const [submitting, handleSubmit] = useProcessify(async (vals: API.Base) => {
    const data: API.Base = { ...model, ...vals };

    const valid = await validateAsset();

    if (!valid) return;

    await loan.postLoan(data.assetId, data.raiseId, parseEther(`${accDiv(current, 2)}`));

    setModel({
      ...data,
      added: current,
      sponsor: plan?.sponsor_company,
    });

    history.push('/lending/result');
  });

  useMount(bindEvents);
  useUnmount(unBindEvents);

  useUpdateEffect(() => {
    form.setFieldValue('percent', formatNum(loanRate, '0'));
  }, [loanRate]);

  useDebounceEffect(() => {
    if (address && model?.address && !isEqual(address, model.address)) {
      handleSuspend();
    }
  }, [address, model?.address]);

  return (
    <>
      <div className="container stake-container py-5">
        <Form
          className="ffi-form"
          form={form}
          size="large"
          initialValues={{
            loanType: 1,
            percent: formatNum(pledgeRate, '0.00'),
            ...model,
          }}
          onFinish={handleSubmit}
        >
          <div className="card stake-card card-body mb-4">
            <LoanRadio name="loanType" />
          </div>

          <div className="card stake-card card-body mb-4">
            <div className="d-flex align-items-center mb-2">
              <div className="flex-fill me-3">
                <h4 className="card-title mb-0">可抵押資產</h4>
              </div>

              <Link to={`/assets/overview/${model?.assetId}`}>
                {formatID(model?.assetId)}@{model?.minerId}
              </Link>
            </div>
            <p className="mb-3 text-gray">“扇區質押”可作為抵押品，“我的算力”的持續收益提供每週還款。</p>

            <div className="card stake-card card-body">
              <div className="row row-cols-2 g-4">
                <div className="col">
                  <p className="mb-1 fw-500 text-gray">扇區質押</p>
                  <p className="mb-0">
                    <span className="fs-4 fw-bold">{formatAmount(pledge)}</span>
                    <span className="ms-1 text-gray">FIL</span>
                  </p>
                </div>
                <div className="col">
                  <p className="mb-1 fw-500 text-gray">已抵押</p>
                  <p className="mb-0">
                    <span className="fs-4 fw-bold">{isLoading ? '-' : formatAmount(collateral)}</span>
                    <span className="ms-1 text-gray">FIL</span>
                  </p>
                </div>
              </div>
            </div>
            {/* <div className="card stake-card card-body">
              <div className="row row-cols-2 g-4">
                <div className="col">
                  <p className="mb-1 fw-500 text-gray">我的算力</p>
                  <p className="mb-0">
                    <span className="fs-4 fw-bold">234,234,456</span>
                    <span className="ms-1 text-gray">TiB</span>
                  </p>
                </div>
                <div className="col">
                  <p className="mb-1 fw-500 text-gray">已抵押</p>
                  <p className="mb-0">
                    <span className="fs-4 fw-bold">68</span>
                    <span className="ms-1 text-gray">%</span>
                  </p>
                </div>
              </div>
            </div> */}
          </div>

          <div className="card stake-card card-body mb-4">
            <h4 className="card-title">調整債務額度</h4>
            <p className="mb-4 text-gray">
              調整滑桿，高於當前債務則產生新貸款，借款上限不能超過抵押品資產價值和還款能力。
            </p>
            <ul className="nav nav-tabs gap-3 mb-4" role="tablist">
              <li className="nav-item" role="presentation">
                <a className="nav-link active" aria-current="page" href="#slider" role="tab" data-bs-toggle="tab">
                  滑桿調節
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a className="nav-link" href="#manual" role="tab" data-bs-toggle="tab">
                  手動輸入
                </a>
              </li>
            </ul>
            <div className="tab-content">
              <div id="slider" className="tab-pane fade show active" role="tabpanel">
                {!manual && (
                  <Slider
                    name="percent"
                    debt={debt ?? 0}
                    max={sliderMax}
                    rate={formatNum(loanRate, '0')}
                    percent={formatNum(pledgeRate, '0.00')}
                  />
                )}
              </div>
              <div id="manual" className="tab-pane fade" role="tabpanel">
                {manual && <Manual name="amount" form={form} max={max} />}
              </div>
            </div>

            <SpinBtn className="btn btn-primary btn-lg w-100" type="submit" disabled={disabled} loading={submitting}>
              新增借款 {formatAmount(current)} FIL
            </SpinBtn>
          </div>
        </Form>

        <div className="card stake-card card-body mb-4">
          {/* <p className="d-flex justify-content-between gap-4 mb-3">
            <span className="text-gray">周还款</span>
            <span className="fw-500">{formatAmount(weekly)} FIL</span>
          </p> */}
          <p className="d-flex justify-content-between gap-4 mb-3">
            <span className="text-gray">剩余可借</span>
            <span className="fw-500">{formatAmount(remain)} FIL</span>
          </p>
          <p className="d-flex justify-content-between gap-4 mb-3">
            <span className="text-gray">借款利率</span>
            <span className="">{formatRate(pool.loanRate, '0.00%')}</span>
          </p>
          <p className="d-flex justify-content-between gap-4 mb-0">
            <span className="text-gray">池中可藉</span>
            <span className="">{formatAmount(pool.available, 0)} FIL</span>
          </p>
        </div>

        <div className="card stake-card card-body">
          <h4 className="card-title">FAQ</h4>
          <p className="text-gray">XXX</p>
        </div>
      </div>
    </>
  );
}
