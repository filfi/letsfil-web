import { parseEther } from 'viem';
import { Form, Input } from 'antd';
import { Modal as BSModal } from 'bootstrap';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';

import styles from '../styles.less';
import Modal from '@/components/Modal';
import * as V from '@/utils/validators';
import BSTabs from '@/components/BSTabs';
import SpinBtn from '@/components/SpinBtn';
import useAccount from '@/hooks/useAccount';
import FFISlider from '@/components/FFISlider';
import useDeptInfo from '../hooks/useDeptInfo';
import useLoanAsset from '../hooks/useLoanAsset';
import useProcessify from '@/hooks/useProcessify';
import LoadingView from '@/components/LoadingView';
import useLoanContract from '@/hooks/useLoanContract';
import { accAdd, accDiv, accMul, accSub, genKey } from '@/utils/utils';
import { formatAddr, formatAmount, formatRate, toFixed } from '@/utils/format';

export type ModalAttrs = {
  hide: () => void;
  show: (fromId: string, toId: string) => void;
};

export type ModalProps = {
  onRefresh?: () => void;
};

// 利息滑点
const SLIP = 0.001;
// const SLIP = 0.1;

const InputWithHelp: React.FC<React.ComponentProps<typeof Input> & { extra?: React.ReactNode }> = ({
  extra,
  ...props
}) => {
  return (
    <>
      <Input {...props} />

      {extra}
    </>
  );
};

const LoanModalRender: React.ForwardRefRenderFunction<ModalAttrs, ModalProps> = ({ onRefresh }, ref) => {
  const modal = useRef<BSModal>();
  const key = useRef(genKey()).current;
  const ul = useRef<HTMLDivElement>(null);

  const [form] = Form.useForm();
  const { address } = useAccount();
  const contract = useLoanContract();
  const amount = Form.useWatch('amount', form);
  const percent = Form.useWatch('percent', form);

  const [toId, setToId] = useState('');
  const [fromId, setFromId] = useState('');
  const [manual, setManual] = useState(false);

  const { fromReward, toReward } = useLoanAsset(fromId, toId);
  const { data: _data, borrow, pledge, interest, error, loading, run, refresh } = useDeptInfo();

  // 可分配奖励之和
  const reward = useMemo(() => accAdd(fromReward, toReward), [fromReward, toReward]);
  // 计算后利息 = 利息 * (1 + 利息滑点)
  const _interest = useMemo(() => accMul(interest, accAdd(1, SLIP)), [interest]); // 加上利息滑点部分
  // 应还利息部分 = Math.max(0, 计算后利息 - 可分配奖励之和)
  const repayInterest = useMemo(() => Math.max(0, accSub(_interest, reward)), [_interest, reward]);

  const max = useMemo(() => Number(toFixed(borrow, 4, 2)), [borrow]);
  const rate = useMemo(() => (Number.isNaN(+percent) ? 0 : accDiv(percent, 100)), [percent]);

  // 应还款
  const repay = useMemo(() => {
    if (manual) {
      const val = +amount;
      return Number.isNaN(val) ? 0 : Math.min(amount, borrow);
    }

    return accMul(borrow, rate);
  }, [amount, borrow, rate, manual]);
  const remain = useMemo(() => Math.max(accSub(borrow, repay), 0), [borrow, repay]);

  const getModal = () => {
    if (!modal.current) {
      modal.current = BSModal.getOrCreateInstance(`#${key}`, {
        keyboard: false,
        backdrop: 'static',
      });
    }

    return modal.current;
  };

  const onTabChange = (e: { key: string }) => {
    setManual(e.key === 'manual');
  };

  const handleHide = () => {
    getModal().hide();

    setFromId('');
    setToId('');
    form.resetFields();
  };

  const handleShow = (fromId: string, toId: string) => {
    setFromId(fromId);
    setToId(toId);

    getModal().show();

    run(fromId, toId);
  };

  const handleAll = () => {
    form.setFieldValue('amount', max);
    form.validateFields(['amount']);
  };

  const [submiting, handleSubmit] = useProcessify(async () => {
    if (!fromId || !toId) return;

    // 还款总额 = 应还 + 应还利息部分
    const value = toFixed(accAdd(repay, repayInterest), 18) as `${number}`;

    await contract.advanceRepay(fromId, toId, {
      value: parseEther(value),
    });

    handleHide();

    onRefresh?.();
  });

  useImperativeHandle(
    ref,
    () => ({
      hide: handleHide,
      show: handleShow,
    }),
    [],
  );

  const renderSliderTab = () =>
    !manual && (
      <>
        <div className="d-flex justify-content-between mb-2 text-gray">
          <div>
            <p className="mb-1 fs-sm">削減後借款</p>
            <p className="mb-1 fw-500">{formatAmount(remain, 4, 2)} FIL</p>
          </div>
          <div className="text-end">
            <p className="mb-1 fs-sm">目前借款</p>
            <p className="mb-1 fw-500">{formatAmount(borrow, 4, 2)} FIL</p>
          </div>
        </div>

        <Form.Item name="percent" rules={[{ required: true, message: '請設定' }]}>
          <FFISlider
            className={styles.slider}
            railStyle={{ '--current-value': `${percent}%` } as any}
            renderLabel={() => <span className="small">償還{formatAmount(repay, 4, 2)} FIL</span>}
          />
        </Form.Item>
      </>
    );

  const renderManualTab = () =>
    manual && (
      <Form.Item
        name="amount"
        rules={[
          { required: true, message: '請輸入金額' },
          {
            validator: V.Queue.create()
              .add(V.createDecimalValidator(8, '最多支援8位小數'))
              .add(V.createGteValidator(0, '不能小於0'))
              .add(V.createLteValidator(max, `最多可還 ${formatAmount(max)} FIL`))
              .build(),
          },
        ]}
      >
        <InputWithHelp
          type="number"
          placeholder="輸入金額"
          extra={
            <p className="d-flex justify-content-between gap-4 mt-1 mb-0">
              <span className="text-gray">目前借款 {formatAmount(borrow, 4, 2)} FIL</span>
              <button type="button" className="btn btn-link p-0" onClick={handleAll}>
                全部填入
              </button>
            </p>
          }
        />
      </Form.Item>
    );

  const renderTab = (tab: { key: string }) => {
    switch (tab.key) {
      case 'slider':
        return renderSliderTab();
      case 'manual':
        return renderManualTab();
    }
    return null;
  };

  return (
    <>
      <Modal id={key} title="削減債務" bodyClassName="p-4" showFooter={false}>
        <div ref={ul} className="ffi-stake">
          <LoadingView data={_data} error={!!error} loading={loading} retry={refresh}>
            <Form
              className="ffi-form"
              form={form}
              size="large"
              initialValues={{ percent: '0' }}
              onFinish={handleSubmit}
            >
              <p className="d-flex align-items-center justify-content-between gap-3 mb-2 px-3 py-2 bg-body-secondary rounded text-gray">
                <span>借款數量</span>
                <span>{formatAmount(borrow, 4, 2)} FIL</span>
              </p>

              <p className="d-flex align-items-center justify-content-between gap-3 mb-2 px-3 py-2 bg-body-secondary rounded text-gray">
                <span>抵押資產</span>
                <span>{formatAmount(pledge)} FIL</span>
              </p>

              <p className="d-flex align-items-center justify-content-between gap-3 mb-2 px-3 py-2 bg-body-secondary rounded text-gray">
                <span>未償利息</span>
                <span className="text-danger">{formatAmount(interest, 4, 2)} FIL</span>
              </p>

              <p className="d-flex align-items-center justify-content-between gap-3 mb-2 px-3 py-2 bg-body-secondary rounded text-gray">
                <span>利息滑點</span>
                <span>{formatRate(SLIP, '0.0 %')}</span>
              </p>

              <p className="mb-3 text-gray-dark">
                使用錢包中的FIL償還借款，債務消減後會降低每週還款額，如有未嚐利息需要先償還利息。確保您當前的錢包(
                {formatAddr(address)}
                )中有足夠的FIL。另外，由於利息即時增加，實際償還利息可能多於當前利息值，如有結餘部分會在交易後返還。
              </p>

              <div className="stake-card">
                <BSTabs
                  tabs={[
                    { key: 'slider', title: '滑竿調節' },
                    { key: 'manual', title: '手動輸入' },
                  ]}
                  tabsClassName="mb-4"
                  renderItem={renderTab}
                  onTabChange={onTabChange}
                />
              </div>

              <div>
                <SpinBtn
                  className="btn btn-success btn-lg w-100"
                  type="submit"
                  loading={submiting}
                  disabled={interest <= 0}
                >
                  償還借款{formatAmount(repay, 4, 2)}FIL 和 利息 {formatAmount(interest, 4, 2)}FIL
                </SpinBtn>
              </div>
            </Form>
          </LoadingView>
        </div>
      </Modal>
    </>
  );
};

const LoanModal = forwardRef(LoanModalRender);

export default LoanModal;
