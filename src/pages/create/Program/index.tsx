import { useMemo } from 'react';
import { useUpdateEffect } from 'ahooks';
import { Form, Input, Skeleton } from 'antd';
import { history, useModel } from '@umijs/max';

import { isMainnet } from '@/constants';
// import Modal from '@/components/Modal';
import FormRadio from '@/components/FormRadio';
import DaysInput from '@/components/DaysInput';
import WhiteList from './components/WhiteList';
import useChainInfo from '@/hooks/useChainInfo';
import * as validators from '@/utils/validators';
import { calcRaiseDepost } from '@/helpers/app';
import { accDiv, accMul, pb2byte } from '@/utils/utils';
import DateTimePicker from '@/components/DateTimePicker';
import { formatAmount, formatNum, toFixed } from '@/utils/format';
import { ReactComponent as IconFIL } from '@/assets/paytype-fil.svg';
import { ReactComponent as IconFFI } from '@/assets/paytype-ffi.svg';

export default function CreateProgram() {
  const [form] = Form.useForm();
  const [data, setData] = useModel('stepform');

  const amount = Form.useWatch('amount', form);
  const planOpen = Form.useWatch('planOpen', form);
  const target = Form.useWatch('targetAmount', form);
  const minRate = Form.useWatch('minRaiseRate', form);
  const amountType = Form.useWatch('amountType', form);

  const { perPledge, isLoading } = useChainInfo();

  const isTargeted = useMemo(() => `${planOpen}` === '2', [planOpen]);
  const rate = useMemo(() => (Number.isNaN(+minRate) ? 0 : accDiv(minRate, 100)), [minRate]);
  const minAmount = useMemo(() => (Number.isNaN(+amount) ? 0 : accMul(amount, rate)), [amount, rate]);

  const evalMax = useMemo(() => {
    let val = 0;

    if (perPledge) {
      // 按金额
      if (amountType === 0) {
        val = accDiv(+amount, perPledge);
      } else {
        // 按算力
        val = accMul(+amount, perPledge);
      }
    }

    return Number.isNaN(val) ? 0 : val;
  }, [amount, amountType, perPledge]);

  const evalMin = useMemo(() => {
    const val = accMul(evalMax, rate);

    return Number.isNaN(val) ? 0 : val;
  }, [evalMax, rate]);

  const deposit = useMemo(() => calcRaiseDepost(target), [target]);

  const amountValidator = async (rule: unknown, value: string) => {
    await validators.integer(rule, value);

    if (value) {
      const val = amountType === 0 ? +amount : evalMax;

      if (val > 5000000) {
        return Promise.reject(`不超过 5,000,000 FIL`);
      }
    }
  };

  const minRateValidator = async (rule: unknown, value: string) => {
    await validators.createNumRangeValidator([0, 99], '最小0%，最大99%')(rule, value);

    await validators.integer(rule, value);

    if (isMainnet && value) {
      const val = amountType === 0 ? minAmount : accMul(minAmount, perPledge);

      if (val < 5000) {
        return Promise.reject(`必须大于 5,000 FIL，当前计算为 ${formatAmount(val)} FIL`);
      }
    }
  };

  useUpdateEffect(() => {
    form.setFieldValue('raiseSecurityFund', deposit);
  }, [deposit]);
  useUpdateEffect(() => {
    const val = Number.isNaN(+amount) ? 0 : +amount;
    // 按金额
    if (amountType === 0) {
      form.setFieldsValue({
        targetAmount: val,
        targetPower: `${Math.floor(pb2byte(accDiv(val, perPledge)))}`,
        // raiseSecurityFund: accMul(val, 0.05),
        ffiProtocolFee: accMul(val, 0.003),
      });
    } else {
      // 按算力
      const amount = toFixed(accMul(val, perPledge), 0);
      form.setFieldsValue({
        targetAmount: amount,
        targetPower: `${pb2byte(amount)}`,
        // raiseSecurityFund: accMul(amount, 0.05),
        ffiProtocolFee: accMul(amount, 0.003),
      });
    }
  }, [amount, amountType, perPledge]);

  const handleSubmit = (vals: API.Base) => {
    setData((d) => ({ ...d, ...vals }));

    history.push('/create/benefit');
  };

  return (
    <>
      <Form
        form={form}
        size="large"
        layout="vertical"
        initialValues={{
          planOpen: 1,
          amountType: 0,
          sealDays: 14,
          raiseDays: 30,
          ffiProtocolFeePayMeth: 1,
          ...data,
        }}
        onFinish={handleSubmit}
      >
        <div className="ffi-form">
          <div className="ffi-item border-bottom">
            <Form.Item name="planOpen">
              <FormRadio
                grid
                items={[
                  { label: '公开计划', desc: '对所有人公开', value: 1 },
                  { label: '定向计划', desc: '定向质押，即将上线。', value: 2 },
                ]}
              />
            </Form.Item>
            {isTargeted && (
              <>
                <p className="text-gray">
                  请在下面指定可参与计划的钱包地址和每个地址的质押限额（未填即无限额）。点击 + 号增加，点击 -
                  号删除。“定向计划”不会在公开列表中显示。主办人需要在私域中将计划的页面链接发给建设者。
                </p>

                <WhiteList name="raiseWhiteList" />
              </>
            )}
          </div>

          <div className="ffi-item border-bottom">
            <h4 className="ffi-label">质押目标</h4>
            <p className="text-gray">填写FIL的质押数量，过低目标不利于硬件设备的充分利用。存储算力是指QAP(Quality-Adjusted Power)</p>

            <Form.Item className="mb-2" name="amountType">
              <FormRadio
                type="button"
                items={[
                  { className: 'border-0', label: '按金额', value: 0 },
                  { className: 'border-0', label: '按算力(QAP)', value: 1 },
                ]}
              />
            </Form.Item>

            <div className="row row-cols-1 row-cols-lg-2 mb-4">
              <div className="col">
                <Form.Item name="amount" rules={[{ required: true, message: '请输入质押目标' }, { validator: amountValidator }]}>
                  <Input placeholder="质押目标" suffix={<span>{['FIL', 'PiB'][amountType]}</span>} />
                </Form.Item>
                <Form.Item name="minRaiseRate" rules={[{ required: true, message: '请输入最低达成比例' }, { validator: minRateValidator }]}>
                  <Input type="number" min={0} max={99} placeholder="最低达成比例" suffix="%" />
                </Form.Item>
                <Form.Item hidden name="targetPower">
                  <Input />
                </Form.Item>
                <Form.Item hidden name="targetAmount">
                  <Input />
                </Form.Item>
              </div>
              <div className="col">
                <div className="card">
                  <div className="card-body">
                    <Skeleton active loading={isLoading} paragraph={{ rows: 1 }}>
                      <div className="d-flex text-neutral mb-3">
                        <span className="fw-600">{['估算存储算力(QAP)', '需要质押FIL'][amountType]}</span>
                        <span className="ms-auto">{data?.sectorSize}G扇区</span>
                      </div>

                      <p className="mb-0 fw-600 lh-base">
                        <span className="fs-3 text-uppercase">{amountType === 0 ? formatAmount(evalMin, 1) : formatNum(evalMin, '0.0a')}</span>
                        <span className="mx-3 mx-lg-4 text-gray">~</span>
                        <span className="fs-3 text-uppercase">{amountType === 0 ? formatAmount(evalMax, 1) : formatNum(evalMax, '0.0a')}</span>
                        <span className="text-neutral ms-2">{['PiB', 'FIL'][amountType]}</span>
                      </p>
                    </Skeleton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ffi-item border-bottom">
            <h4 className="ffi-label">时间计划</h4>
            <p className="text-gray">到达开放时间，如果满足所有开放条件计划自动启动，如果不满足开放条件计划自动关闭。</p>

            <div className="row row-cols-1 row-cols-lg-2 g-3">
              <div className="col">
                <p className="mb-1 fw-500">开放时间</p>

                <Form.Item name="beginTime" rules={[{ required: true, message: '请选择开放时间' }]}>
                  <DateTimePicker placeholder="开放时间" />
                </Form.Item>
              </div>
              <div className="col">
                <p className="mb-1 fw-500">持续时间</p>

                <Form.Item name="raiseDays" rules={[{ required: true, message: '请输入持续时间' }, { validator: validators.integer }]}>
                  <Input type="number" placeholder="输入天数" />
                </Form.Item>
              </div>
            </div>
          </div>
          {/* <div className="ffi-item border-bottom">
            <h4 className="ffi-label">质押时间</h4>
            <p className="text-gray">节点计划保持开放的持续时间。启动时间由主办人决定。</p>

            <Form.Item name="raiseDays" rules={[{ required: true, message: '请输入天数' }, { validator: validators.integer }]}>
              <DaysInput
                options={[
                  { label: '7天', value: 7 },
                  { label: '15天', value: 15 },
                  { label: '20天', value: 20 },
                  { label: '30天', value: 30 },
                  { label: '45天', value: 45 },
                ]}
              />
            </Form.Item>
          </div> */}

          <div className="ffi-item border-bottom">
            <h4 className="ffi-label">封装时间</h4>
            <p className="text-gray">
              承诺的封装时间，超期会对主办人产生罚金。与您的技术服务商一起选择合理且有竞争力的时长。
              {/* <a className="text-underline" href="#time-modal" data-bs-toggle="modal">
                了解更多
              </a> */}
            </p>

            <Form.Item name="sealDays" rules={[{ required: true, message: '请输入天数' }, { validator: validators.integer }]}>
              <DaysInput
                options={[
                  { label: '3天', value: 3 },
                  { label: '5天', value: 5 },
                  { label: '7天', value: 7 },
                  { label: '10天', value: 10 },
                  { label: '14天', value: 14 },
                ]}
              />
            </Form.Item>
          </div>

          <div className="ffi-item border-bottom">
            <h4 className="ffi-label">主办人保证金</h4>
            <p className="text-gray">
              保障集合质押和封装进度的保证金和FilFi协议手续费，预缴数额分别为质押目标的5%和0.3%。
              {/* <a className="text-underline" href="#deposit-modal" data-bs-toggle="modal">
                了解更多
              </a> */}
            </p>

            <Form.Item hidden name="raiseSecurityFund">
              <Input />
            </Form.Item>

            <div className="card mb-4">
              <div className="card-body">
                <p className="mb-1 lh-base">
                  <span className="fs-4 fw-600 mb-0">{formatAmount(deposit)}</span>
                  <span className="ms-1 text-gray">FIL</span>
                </p>
                <p className="mb-0 text-gray">计算包括质押期和封装期的可能罚金，以及FilFi协议手续费（参见下一项）</p>
              </div>
            </div>
          </div>

          <div className="ffi-item">
            <h4 className="ffi-label">协议手续费</h4>
            <p className="text-gray">创建新的节点计划会产生“FilFi协议手续费”，费用为质押金额*0.3%，质押不成功不产生手续费。</p>

            <Form.Item name="ffiProtocolFeePayMeth">
              <FormRadio
                grid
                checkbox
                items={[
                  {
                    value: 1,
                    icon: <IconFIL />,
                    label: '使用 FIL 支付',
                    desc: '质押成功后从“主办人保证金”中自动扣减',
                  },
                  {
                    value: 2,
                    disabled: true,
                    icon: <IconFFI />,
                    label: '使用 FFI 支付',
                    desc: (
                      <span>
                        即将上线
                        <br />
                        （FFI是FilFi的社区治理代币）
                      </span>
                    ),
                  },
                ]}
              />
            </Form.Item>
            <Form.Item hidden name="ffiProtocolFee">
              <Input />
            </Form.Item>
          </div>
        </div>

        <div className="border-top my-4"></div>

        <div className="ffi-form">
          <div className="ffi-form-actions">
            <button className="btn btn-light btn-lg" type="button" onClick={history.back}>
              上一步
            </button>
            <button className="btn btn-primary btn-lg" type="submit">
              下一步
            </button>
          </div>
        </div>
      </Form>

      {/* <Modal.Alert id="time-modal" title="封装时间" confirmText="我知道了">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">承诺的封装时间，超期会对主办人产生罚金。与您的技术服务商一起选择合理且有竞争力的时长。</p>
          </div>
        </div>
      </Modal.Alert>

      <Modal.Alert id="deposit-modal" title="主办人保证金" confirmText="我知道了">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">根据节点计划自动计算，节点计划成功上链之后放开存入。封装工作完成后，主办人即可取回保证金。</p>
          </div>
        </div>
      </Modal.Alert> */}
    </>
  );
}
