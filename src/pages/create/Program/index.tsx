import { useMemo } from 'react';
import { useUpdateEffect } from 'ahooks';
import { Form, Input, Skeleton } from 'antd';
import { history, useModel } from '@umijs/max';

import Modal from '@/components/Modal';
import FormRadio from '@/components/FormRadio';
import DaysInput from '@/components/DaysInput';
import useChainInfo from '@/hooks/useChainInfo';
import * as validators from '@/utils/validators';
import { formatAmount, formatNum } from '@/utils/format';
import { accAdd, accDiv, accMul, pb2byte } from '@/utils/utils';
import { ReactComponent as IconFIL } from '@/assets/paytype-fil.svg';
import { ReactComponent as IconFFI } from '@/assets/paytype-ffi.svg';

/**
 * 计算募集保证金
 * @param target 募集目标
 * @param period 募集期限
 * @param seals 封装期限
 * @returns
 */
function calcRaiseDepost(target: number, period: number, seals: number) {
  // 延长期
  const delay = accDiv(seals, 2);
  // 计算金额
  const amount = accDiv(target, 2);
  // 利率
  const rate = accDiv(0.01, 365);

  // 募集期罚息 = 金额 * 利率 * 募集期限
  const rInterest = accMul(accMul(amount, rate), period);
  // 封装期罚息 = 金额 * 利率 * 2 * 封装期限
  const sInterest = accMul(accMul(accMul(amount, rate), 2), seals);
  // 延长期罚息 = 金额 * 利率 * 2 * 延长期限
  const dInterest = accMul(accMul(accMul(amount, rate), 2), delay);
  // 协议罚金 = 金额 * 1‰ * 募集期限
  const pInterest = accMul(accMul(amount, 0.001), period);
  // 募集手续费 = 金额 * 3‰
  const fee = accMul(amount, 0.003);

  // 加总
  const total = accAdd(accAdd(accAdd(accAdd(rInterest, sInterest), dInterest), pInterest), fee);

  return Number.isNaN(total) ? 0 : total;
}

export default function CreateProgram() {
  const [form] = Form.useForm();
  const [data, setData] = useModel('stepform');

  const amount = Form.useWatch('amount', form);
  const seals = Form.useWatch('sealDays', form);
  const period = Form.useWatch('raiseDays', form);
  const target = Form.useWatch('targetAmount', form);
  const minRate = Form.useWatch('minRaiseRate', form);
  const amountType = Form.useWatch('amountType', form);
  const { perPledge, loading: fetching } = useChainInfo();

  const rate = useMemo(() => (Number.isNaN(+minRate) ? 0 : accDiv(minRate, 100)), [minRate]);
  // const minAmount = useMemo(() => Number.isNaN(+amount) ? 0 : accMul(amount, rate), [amount, rate]);

  const evalMax = useMemo(() => {
    if (Number.isNaN(+amount) || perPledge === 0) return 0;

    // 按金额
    if (amountType === 0) {
      return accDiv(+amount, perPledge);
    }

    // 按算力
    return accMul(+amount, perPledge);
  }, [amount, amountType, perPledge]);

  const evalMin = useMemo(() => accMul(evalMax, rate), [evalMax, rate]);

  // 发起人保证金
  const deposit = useMemo(() => calcRaiseDepost(target, period, seals), [target, period, seals]);

  const amountValidator = async (rule: unknown, value: string) => {
    await validators.number(rule, value);

    if (value) {
      const val = amountType === 0 ? +amount : evalMax;

      if (val > 5000000) {
        return Promise.reject(`不超过 5,000,000 FIL`);
      }
    }
  };

  const minRateValidator = async (rule: unknown, value: string) => {
    await validators.createNumRangeValidator([0, 99], '最小0%，最大99%')(rule, value);

    // TODO: min validate
    // if (value) {
    //   const val = amountType === 0 ? minAmount : accMul(minAmount, perPledge);

    //   if (val < 5000) {
    //     return Promise.reject(`必须大于 5,000 FIL，当前计算为 ${formatAmount(val)} FIL`);
    //   }
    // }
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
      const amount = accMul(val, perPledge);
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
          ffiProtocolFeePayMeth: 1,
          raiseDays: 30,
          sealDays: 14,
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
                  { label: '公募计划', desc: '对所有人公开', value: 1 },
                  { label: '私募计划', desc: '定向募集，即将上线。', disabled: true, value: 2 },
                ]}
              />
            </Form.Item>
          </div>

          <div className="ffi-item border-bottom">
            <h4 className="ffi-label">募集目标</h4>
            <p className="text-gray">填写FIL的募集数量，过低目标不利于硬件设备的充分利用。存储算力是指QAP(Quality-Adjusted Power)</p>

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
                <Form.Item name="amount" rules={[{ required: true, message: '请输入募集目标' }, { validator: amountValidator }]}>
                  <Input placeholder="募集目标" suffix={<span>{['FIL', 'PiB'][amountType]}</span>} />
                </Form.Item>
                <Form.Item name="minRaiseRate" rules={[{ required: true, message: '请输入最低募集比例' }, { validator: minRateValidator }]}>
                  <Input type="number" min={0} max={99} placeholder="最低募集比例" suffix="%" />
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
                    <Skeleton active loading={fetching} paragraph={{ rows: 1 }}>
                      <div className="d-flex text-neutral mb-3">
                        <span className="fw-600">{['估算存储算力(QAP)', '需要质押币'][amountType]}</span>
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
            <h4 className="ffi-label">募集时间</h4>
            <p className="text-gray">募集计划启动后的持续时间，此间开放FIL投资。启动时间由发起人决定。</p>

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
          </div>

          <div className="ffi-item border-bottom">
            <h4 className="ffi-label">封装时间</h4>
            <p className="text-gray">
              承诺的封装时间，超期会对发起人产生罚金。与您的技术服务商一起选择合理且有竞争力的时长。
              <a className="text-underline" href="#time-modal" data-bs-toggle="modal">
                了解更多
              </a>
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
            <h4 className="ffi-label">发起人保证金</h4>
            <p className="text-gray">
              根据募集计划自动计算，募集计划成功上链之后放开存入。封装工作完成后，发起人即可取回保证金。
              <a className="text-underline" href="#deposit-modal" data-bs-toggle="modal">
                了解更多
              </a>
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
                <p className="mb-0 text-gray">计算包括募集期和封装期的可能罚金，以及FilFi协议手续费（参见下一项）</p>
              </div>
            </div>
          </div>

          <div className="ffi-item">
            <h4 className="ffi-label">协议手续费</h4>
            <p className="text-gray">创建新的募集计划会产生“FilFi协议手续费”，费用为实际募集金额*0.3%，募集不成功不产生手续费。</p>

            <Form.Item name="ffiProtocolFeePayMeth">
              <FormRadio
                grid
                checkbox
                items={[
                  {
                    value: 1,
                    icon: <IconFIL />, // <img src={require('@/assets/paytype-fil.png')} />,
                    label: '使用 FIL 支付',
                    desc: '募集成功后从“发起人保证金”中自动扣减',
                  },
                  {
                    value: 2,
                    disabled: true,
                    icon: <IconFFI />, // <img src={require('@/assets/paytype-ffi.png')} />,
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

      <Modal.Alert id="time-modal" title="封装时间" confirmText="我知道了">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">承诺的封装时间，超期会对发起人产生罚金。与您的技术服务商一起选择合理且有竞争力的时长。</p>
          </div>
        </div>
      </Modal.Alert>

      <Modal.Alert id="deposit-modal" title="发起人保证金" confirmText="我知道了">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">根据募集计划自动计算，募集计划成功上链之后放开存入。封装工作完成后，发起人即可取回保证金。</p>
          </div>
        </div>
      </Modal.Alert>
    </>
  );
}
