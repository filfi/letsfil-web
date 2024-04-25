import { useMemo } from 'react';
import { useUpdateEffect } from 'ahooks';
import { Form, Input, Skeleton } from 'antd';
import { history, useModel } from '@umijs/max';

import { isMainnet } from '@/constants';
import Dialog from '@/components/Dialog';
import FormRadio from '@/components/FormRadio';
import DaysInput from '@/components/DaysInput';
import WhiteList from './components/WhiteList';
import useChainInfo from '@/hooks/useChainInfo';
import * as validators from '@/utils/validators';
import { calcRaiseDepost } from '@/helpers/app';
import DateTimePicker from '@/components/DateTimePicker';
import { formatAmount, formatNum, toFixed } from '@/utils/format';
import { accDiv, accMul, disabledDate, pb2byte, toEthAddr } from '@/utils/utils';
import { ReactComponent as IconFIL } from '@/assets/paytype-fil.svg';
import { ReactComponent as IconFFI } from '@/assets/paytype-ffi.svg';

export default function CreateProgram() {
  const [form] = Form.useForm();
  const [model, setModel] = useModel('stepform');

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
        return Promise.reject(`不超過 5,000,000 FIL`);
      }
    }
  };

  const minRateValidator = async (rule: unknown, value: string) => {
    await validators.createNumRangeValidator([0, 99], '最小0%，最大99%')(rule, value);

    await validators.integer(rule, value);

    if (isMainnet && value) {
      const val = amountType === 0 ? minAmount : accMul(minAmount, perPledge);

      if (val < 5000) {
        return Promise.reject(`必須大於 5,000 FIL，目前計算為 ${formatAmount(val)} FIL`);
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

  const showErr = (content: string, title: string) => {
    Dialog.error({ content, title });
  };

  const validateWhitelist = (list: API.Base[]) => {
    const title = '定向計劃';

    if (!Array.isArray(list) || !list.length) {
      showErr('請指定可參與計劃的錢包地址和每個地址的質押限額', title);
      return false;
    }

    const items = list.filter(Boolean).map(({ address }) => toEthAddr(address).toLowerCase());

    if (new Set(items).size !== items.length) {
      showErr('可參與計畫的錢包位址不能重複', title);
      return false;
    }

    return true;
  };

  const handleSubmit = (vals: API.Base) => {
    if (isTargeted && !validateWhitelist(vals.raiseWhiteList)) return;

    setModel((d) => ({ ...d, ...vals }));

    history.push('/create/benefit');
  };

  return (
    <>
      <Form
        form={form}
        size="large"
        layout="vertical"
        initialValues={{
          isShow: 1,
          planOpen: 1,
          amountType: 0,
          sealDays: 14,
          raiseDays: 30,
          ffiProtocolFeePayMeth: 1,
          beginTime: new Date(),
          ...model,
        }}
        onFinish={handleSubmit}
      >
        <div className="ffi-form">
          <div className="ffi-item border-bottom">
            <Form.Item name="planOpen">
              <FormRadio
                grid
                items={[
                  { label: '公開計劃', desc: '對所有人公開', value: 1 },
                  { label: '定向計劃', desc: '非公开，仅指定钱包地址可参与', value: 2 },
                ]}
              />
            </Form.Item>
            {isTargeted && (
              <>
                <p className="text-gray">
                  請在下方指定可參與計畫的錢包地址和每個地址的質押限額（未填即無限額）。點選 + 號增加，點選 - 號刪除。
                </p>

                <WhiteList form={form} name="raiseWhiteList" />
              </>
            )}
          </div>

          {isTargeted && (
            <div className="ffi-item border-bottom">
              <Form.Item name="isShow">
                <FormRadio
                  grid
                  items={[
                    {
                      label: '公開顯示',
                      icon: <span className="bi bi-eye fs-lg"></span>,
                      desc: '計劃將會在公開清單中顯示，所有建造者都可查看',
                      value: 1,
                    },
                    {
                      label: '不公開顯示',
                      icon: <span className="bi bi-eye-slash fs-lg"></span>,
                      desc: '計劃將不會在公開列表中顯示，主辦人需要將計劃連結發送給建設者',
                      value: 2,
                    },
                  ]}
                />
              </Form.Item>
            </div>
          )}

          <div className="ffi-item border-bottom">
            <h4 className="ffi-label">質押目標</h4>
            <p className="text-gray">
              填寫FIL的質押數量，過低目標不利於硬體設備的充分利用。儲存算力是指QAP(Quality-Adjusted Power)
            </p>

            <Form.Item className="mb-2" name="amountType">
              <FormRadio
                type="button"
                items={[
                  { className: 'border-0', label: '按金額', value: 0 },
                  { className: 'border-0', label: '按算力(QAP)', value: 1 },
                ]}
              />
            </Form.Item>

            <div className="row row-cols-1 row-cols-lg-2 mb-4">
              <div className="col">
                <Form.Item
                  name="amount"
                  rules={[{ required: true, message: '請輸入質押目標' }, { validator: amountValidator }]}
                >
                  <Input placeholder="質押目標" suffix={<span>{['FIL', 'PiB'][amountType]}</span>} />
                </Form.Item>
                <Form.Item
                  name="minRaiseRate"
                  rules={[{ required: true, message: '請輸入最低達成比例' }, { validator: minRateValidator }]}
                >
                  <Input type="number" min={0} max={99} placeholder="最低達成比例" suffix="%" />
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
                        <span className="fw-600">{['估算儲存算力(QAP)', '需要質押FIL'][amountType]}</span>
                        <span className="ms-auto">{model?.sectorSize}G扇區</span>
                      </div>

                      <p className="mb-0 fw-600 lh-base">
                        <span className="fs-3 text-uppercase">
                          {amountType === 0 ? formatAmount(evalMin, 1) : formatNum(evalMin, '0.0a')}
                        </span>
                        <span className="mx-3 mx-lg-4 text-gray">~</span>
                        <span className="fs-3 text-uppercase">
                          {amountType === 0 ? formatAmount(evalMax, 1) : formatNum(evalMax, '0.0a')}
                        </span>
                        <span className="text-neutral ms-2">{['PiB', 'FIL'][amountType]}</span>
                      </p>
                    </Skeleton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ffi-item border-bottom">
            <h4 className="ffi-label">時間計劃</h4>
            <p className="text-gray">
              到達開放時間，如果滿足所有開放條件計畫自動啟動，如果不符合開放條件計畫自動關閉。
            </p>

            <div className="row row-cols-1 row-cols-lg-2 g-3">
              <div className="col">
                <p className="mb-1 fw-500">開放時間</p>

                <Form.Item name="beginTime" rules={[{ required: true, message: '請選擇開放時間' }]}>
                  <DateTimePicker disabledDate={disabledDate} timeFormat="HH:mm:ss" placeholder="開放時間" />
                </Form.Item>
              </div>
              <div className="col">
                <p className="mb-1 fw-500">持續時間</p>

                <Form.Item
                  name="raiseDays"
                  rules={[{ required: true, message: '請輸入持續時間' }, { validator: validators.integer }]}
                >
                  <Input type="number" placeholder="輸入天數" suffix="天" />
                </Form.Item>
              </div>
            </div>
          </div>
          {/* <div className="ffi-item border-bottom">
            <h4 className="ffi-label">質押時間</h4>
            <p className="text-gray">节点计划保持开放的持續時間。启动时间由主办人决定。</p>

            <Form.Item name="raiseDays" rules={[{ required: true, message: '請輸入天数' }, { validator: validators.integer }]}>
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
            <h4 className="ffi-label">封裝時間</h4>
            <p className="text-gray">
              承諾的封裝時間，超期會對主辦人產生罰金。與您的技術服務商一起選擇合理且有競爭力的時長。
              {/* <a className="text-underline" href="#time-modal" data-bs-toggle="modal">
                了解更多
              </a> */}
            </p>

            <Form.Item
              name="sealDays"
              rules={[{ required: true, message: '請輸入天数' }, { validator: validators.integer }]}
            >
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
            <h4 className="ffi-label">主辦人保證金</h4>
            <p className="text-gray">
              保障集合质押和封装进度的保证金和FilFi协议手续费，预缴数额分别为質押目標的5%和0.3%。
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
                <p className="mb-0 text-gray">計算包括質押期和封裝期的可能罰金，以及FilFi協議手續費（請參閱下一項）</p>
              </div>
            </div>
          </div>

          <div className="ffi-item">
            <h4 className="ffi-label">協議手續費</h4>
            <p className="text-gray">
              創建新的節點計劃會產生“FilFi協議手續費”，費用為質押金額*0.3%，質押不成功不產生手續費。
            </p>

            <Form.Item name="ffiProtocolFeePayMeth">
              <FormRadio
                grid
                checkbox
                items={[
                  {
                    value: 1,
                    icon: <IconFIL />,
                    label: '使用 FIL 支付',
                    desc: '質押成功後從“主辦人保證金”自動扣減',
                  },
                  {
                    value: 2,
                    disabled: true,
                    icon: <IconFFI />,
                    label: '使用 FFI 支付',
                    desc: (
                      <span>
                        即將上線
                        <br />
                        （FFI是FilFi的社群治理代幣）
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

      {/* <Modal.Alert id="time-modal" title="封裝時間" confirmText="我知道了">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">承諾的封裝時間，超期會對主辦人產生罰金。與您的技術服務商一起選擇合理且有競爭力的時長。</p>
          </div>
        </div>
      </Modal.Alert>

      <Modal.Alert id="deposit-modal" title="主办人保证金" confirmText="我知道了">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">根據節點計畫自動計算，節點計畫成功上鍊之後放開存入。封裝工作完成後，主辦人即可取回保證金。</p>
          </div>
        </div>
      </Modal.Alert> */}
    </>
  );
}
