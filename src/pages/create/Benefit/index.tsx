import { snakeCase } from 'lodash';
import classNames from 'classnames';
import { useUpdateEffect } from 'ahooks';
import { Avatar, Form, Input } from 'antd';
import { history, useModel } from '@umijs/max';
import { useEffect, useMemo, useRef } from 'react';

import * as A from '@/apis/raise';
import * as H from '@/helpers/app';
import styles from './styles.less';
// import Modal from '@/components/Modal';
import Dialog from '@/components/Dialog';
import OrgTree from '@/components/OrgTree';
import SpinBtn from '@/components/SpinBtn';
import { catchify } from '@/utils/hackify';
import useProviders from '@/hooks/useProviders';
import BenefitPie from './components/BenefitPie';
import StepsModal from './components/StepsModal';
import AssetsModal from './components/AssetsModal';
import useLoadingify from '@/hooks/useLoadingify';
import { createNumRangeValidator } from '@/utils/validators';
import { accDiv, accMul, accSub, isEqual } from '@/utils/utils';
import { formatEther, formatNum, toFixed } from '@/utils/format';
import { ReactComponent as IconLock } from '@/assets/icons/icon-lock.svg';
import { ReactComponent as IconBorder } from '@/assets/icons/icon-border.svg';

type Values = ReturnType<typeof H.calcEachEarn>;

const defaultTreeData = {
  label: '总收益',
  rate: 100,
  desc: '全部算力的全部产出',
  children: [
    {
      label: '出币方分成',
      active: true,
      rate: 0,
      desc: '出币方的权益',
      children: [
        {
          label: '投资人分成',
          rate: 0,
          desc: '优先质押币的权益',
        },
        {
          label: '运维保证金分成',
          rate: 0,
          locked: true,
          desc: '劣后质押币的权益',
        },
      ],
    },
    {
      label: '建设方分成',
      rate: 0,
      desc: '建设方的权益',
      children: [
        {
          label: '技术运维服务费',
          rate: 0,
          active: true,
          locked: true,
          desc: '技术服务商的权益',
        },
        {
          label: '发起人分成',
          rate: 0,
          desc: '募集计划的管理人',
        },
        {
          label: 'FilFi协议分成',
          rate: 0,
          locked: true,
          desc: '固定为建设方权益的8%',
        },
      ],
    },
  ],
};

const getTreeData = (priority: number = 70, spRate = 5, ratio = 5) => {
  const data = Object.assign({}, defaultTreeData);
  const vals = H.calcEachEarn(priority, spRate, ratio);

  data.children[0].rate = vals.priority;
  data.children[0].children[0].rate = vals.investRate;
  data.children[0].children[1].rate = vals.opsRate;
  data.children[1].rate = vals.inferior;
  data.children[1].children[0].rate = vals.spRate;
  data.children[1].children[1].rate = vals.raiserRate;
  data.children[1].children[2].rate = vals.ffiRate;

  return data;
};

export default function CreateBenefit() {
  const modal = useRef<ModalAttrs>(null);

  const [form] = Form.useForm();
  const { getProvider } = useProviders();
  const [model, setModel] = useModel('stepform');
  const spRate = Form.useWatch('opServerShare', form);
  const priority = Form.useWatch('raiserCoinShare', form);
  const ratio = Form.useWatch('opsSecurityFundRate', form);
  const powerRate = Form.useWatch('raiseHisPowerRate', form);
  const pledgeRate = Form.useWatch('raiseHisInitialPledgeRate', form);

  const pieVal = useMemo(() => (Number.isNaN(+ratio) ? 0 : +ratio), [ratio]);
  const priorityRate = useMemo(() => Math.max(accSub(100, pieVal), 0), [pieVal]);
  const provider = useMemo(() => getProvider(model?.serviceId), [model, getProvider]);
  const treeData = useMemo(() => getTreeData(priority, spRate, pieVal), [priority, spRate, pieVal]);
  const servicerPowerRate = useMemo(() => Math.max(accSub(100, Number.isNaN(+powerRate) ? 0 : +powerRate), 0), [powerRate]);
  const servicerPledgeRate = useMemo(() => Math.max(accSub(100, Number.isNaN(+pledgeRate) ? 0 : +pledgeRate), 0), [pledgeRate]);

  useEffect(() => {
    const target = model?.targetAmount ?? 0;
    // 实际保证金配比：运维保证金配比 = 运维保证金 / (运维保证金 + 已募集金额)
    const amount = accDiv(accMul(target, accDiv(pieVal, 100)), accSub(1, accDiv(pieVal, 100)));

    form.setFieldValue('opsSecurityFund', Number.isNaN(amount) ? 0 : toFixed(amount, 2, 2));
  }, [model?.targetAmount, pieVal]);
  useUpdateEffect(() => {
    if (provider) {
      form.setFieldValue('opsSecurityFundAddr', provider?.wallet_address);
    }
  }, [provider]);

  const handleReset = () => {
    form.setFieldsValue({
      opServerShare: 5,
      raiserCoinShare: 70,
    });
  };

  const handleSteps = ({ priority, spRate }: Values) => {
    form.setFieldsValue({
      opServerShare: spRate,
      raiserCoinShare: priority,
    });
  };

  const [loading, handleSubmit] = useLoadingify(async (vals?: API.Base) => {
    const data = vals ?? model;

    if (!data) return;

    let raiseId = data.raisingId;
    const params = H.transformParams(data);
    const body = Object.keys(params).reduce(
      (d, key) => ({
        ...d,
        [snakeCase(key)]: params[key as keyof typeof params],
      }),
      {},
    );

    console.log('[post body]: %o', body);

    const [e] = await catchify(async () => {
      if (raiseId) {
        await A.update(raiseId, body);
      } else {
        raiseId = H.genRaiseID(data.minerId).toString();
        await A.add({ ...body, raising_id: raiseId });
      }
    })();

    if (e) {
      Dialog.alert({
        icon: 'error',
        title: '提交失败',
        content: e.message,
      });
      return;
    }

    history.push(`/create/result/${raiseId.toString()}`);
  });

  const handleNext = (vals: API.Base) => {
    const data = { ...model, ...vals };
    setModel(data);

    if (isEqual(data.minerType, 2)) {
      modal.current?.show();
      return;
    }

    handleSubmit(data);
  };

  const renderTreeContent = (data: any) => {
    return (
      <div className={classNames(styles.node, { [styles.active]: data.active })}>
        <p className="d-flex flex-wrap flex-lg-nowrap mb-1 fw-500">
          <span className="me-auto">{data.label}</span>
          <span className="ms-lg-2 fw-bold">{formatNum(data.rate, '0.00')}%</span>
        </p>
        <p className="small mb-0 text-gray">{data.desc}</p>

        {data.locked && (
          <span className={styles.lock}>
            <IconLock />
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <Form
        form={form}
        size="large"
        layout="vertical"
        initialValues={{
          opServerShare: 5,
          raiserCoinShare: 70,
          opsSecurityFundRate: 5,
          opsSecurityFundAddr: provider?.wallet_address,
          ...model,
        }}
        onFinish={handleNext}
      >
        <div className="ffi-form">
          <div className="ffi-item border-bottom">
            <h4 className="ffi-label">技术运维保证金</h4>
            <p className="text-gray">
              发起人要求技术服务商存入保证金，保证金将做为劣后质押币，与投资人的质押币一起封装到存储节点，优先承担Filecoin网络罚金。保证金占质押币的比例不低于5%，提高占比要求，可提高对投资人的吸引力。
              {/* <a className="text-underline" href="#deposit-modal" data-bs-toggle="modal">
                了解更多
              </a> */}
            </p>

            <Form.Item hidden name="opsSecurityFund">
              <Input />
            </Form.Item>
            <Form.Item hidden name="opsSecurityFundAddr">
              <Input />
            </Form.Item>

            <div className="row row-cols-1 row-cols-md-2 g-3 g-lg-4 mb-4">
              <div className="col">
                <div className="mb-1 fw-500">劣后质押币(技术运维保证金)</div>
                <Form.Item
                  name="opsSecurityFundRate"
                  rules={[{ required: true, message: '请输入' }, { validator: createNumRangeValidator([5, 100], '最小5%， 最大100%') }]}
                >
                  <Input
                    className="text-end"
                    type="number"
                    min={5}
                    max={100}
                    prefix={
                      <div className="d-flex">
                        <Avatar size={24} src={provider?.logo_url} />
                        <span className="ms-1 text-gray-dark">{provider?.short_name}</span>
                      </div>
                    }
                    suffix="%"
                    placeholder="请输入"
                  />
                </Form.Item>

                <div className="mb-1 fw-500">优先质押币</div>
                <Form.Item noStyle>
                  <Input
                    className="bg-light text-end"
                    suffix="%"
                    readOnly
                    prefix={
                      <div>
                        <span className="bi bi-people align-middle"></span>
                        <span className="ms-2 text-gray-dark">投资人</span>
                      </div>
                    }
                    value={priorityRate}
                  />
                </Form.Item>
              </div>
              <div className="col pt-3">
                <BenefitPie name={provider?.short_name} value={pieVal} />
              </div>
            </div>
          </div>

          <div className="ffi-item">
            <h4 className="ffi-label">算力/收益分配方案</h4>
            <p className="text-gray">
              新增存储算力获得的收益，智能合约严格执行分配方案。点击修改按钮调整分配方案。
              {/* <a className="text-underline" href="#build-modal" data-bs-toggle="modal">
                了解更多
              </a> */}
            </p>

            <Form.Item hidden name="raiserCoinShare">
              <Input />
            </Form.Item>
            <Form.Item hidden name="opServerShare">
              <Input />
            </Form.Item>

            <div className={classNames('card', styles.card)}>
              <div className="card-body">
                <OrgTree data={treeData} className={styles.tree} nodeClassName="w-100" renderContent={renderTreeContent} />
              </div>
              <div className="card-footer">
                <div className="row row-cols-1 row-cols-lg-2 g-3">
                  <div className="col small">
                    <p className="text-gray mb-1">
                      <IconLock />
                      <span className="align-middle ms-2">加锁的权益永久锁定，未来不可交易</span>
                    </p>
                    <p className="text-gray mb-1">
                      <IconBorder />
                      <span className="align-middle ms-2">需要发起人填写的比例，其他比例自动计算</span>
                    </p>
                  </div>
                  <div className="col">
                    <div className="d-flex gap-3">
                      <button className="btn btn-light btn-lg" type="button" onClick={handleReset}>
                        重置
                      </button>
                      <a className="btn btn-primary btn-lg flex-fill" href="#benefit-modal" data-bs-toggle="modal" role="button">
                        修改
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {model && isEqual(model?.minerType, 2) && (
            <>
              <div className="border-top my-4" />

              <div className="ffi-item">
                <h4 className="ffi-label">{model.minerId}历史资产的归属</h4>
                <p className="text-gray">
                  检测到 {model.minerId}{' '}
                  是已经存在的节点，历史资产收益不计入此募集计划，按以下约定独立分配，技术服务商移交Owner权限时对约定比例进行确认（要求技术服务商的收益分成比例不低于10%）。历史资产的质押币100%归属发起人。
                  {/* <a className="text-underline" href="#assets-modal" data-bs-toggle="modal">
                    了解更多
                  </a> */}
                </p>

                <div className="px-4 mb-4">
                  <div className="row row-cols-2 row-cols-lg-4 g-3 g-lg-4">
                    <div className="col">
                      <p className="mb-0 fw-500">{formatNum(model.hisPower, '0.0 ib')}</p>
                      <p className="mb-0 text-gray-dark">算力(QAP)</p>
                    </div>
                    <div className="col">
                      <p className="mb-0 fw-500">{formatEther(model.hisInitialPledge)} FIL</p>
                      <p className="mb-0 text-gray-dark">质押币</p>
                    </div>
                    <div className="col">
                      <p className="mb-0 fw-500">{formatEther(model.hisBlance)} FIL</p>
                      <p className="mb-0 text-gray-dark">余额（含线性释放）</p>
                    </div>
                    <div className="col">
                      <p className="mb-0 fw-500">{model.hisSectorCount} 个</p>
                      <p className="mb-0 text-gray-dark">扇区数量</p>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column flex-lg-row gap-3 gap-lg-4 mb-4 ps-4 ps-lg-0 position-relative">
                  <div className="flex-full">
                    <Form.Item
                      name="raiseHisPowerRate"
                      rules={[{ required: true, message: '请输入' }, { validator: createNumRangeValidator([0, 100], '最小0%，最大100%') }]}
                    >
                      <Input
                        className="text-end"
                        type="number"
                        min={0}
                        max={100}
                        prefix={<span className="text-gray-dark">我的算力</span>}
                        suffix="%"
                        placeholder="请输入"
                      />
                    </Form.Item>
                  </div>
                  <div className={classNames('flex-shrink-0 py-2', styles.line)}>
                    <span className="text-gray">-</span>
                  </div>
                  <div className="flex-full">
                    <Input
                      readOnly
                      className="bg-light text-end"
                      prefix={
                        <div className="d-flex">
                          <Avatar size={24} src={provider?.logo_url} />
                          <span className="ms-1 text-gray-dark">{provider?.short_name}</span>
                        </div>
                      }
                      suffix="%"
                      value={servicerPowerRate}
                    />
                  </div>
                </div>
                <div className="d-flex flex-column flex-lg-row gap-3 gap-lg-4 ps-4 ps-lg-0 position-relative">
                  <div className="flex-full">
                    <Form.Item noStyle name="raiseHisInitialPledgeRate">
                      <Input className="bg-light text-end" readOnly prefix={<span className="text-gray-dark">我的质押币</span>} suffix="%" />
                    </Form.Item>
                  </div>
                  <div className={classNames('flex-shrink-0 py-2', styles.line)}>
                    <span className="text-gray">-</span>
                  </div>
                  <div className="flex-full">
                    <Input
                      readOnly
                      className="bg-light text-end"
                      prefix={
                        <div className="d-flex">
                          <Avatar size={24} src={provider?.logo_url} />
                          <span className="ms-1 text-gray-dark">{provider?.short_name}</span>
                        </div>
                      }
                      suffix="%"
                      value={servicerPledgeRate}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="border-top my-4"></div>

        <div className="ffi-form">
          <div className="ffi-form-actions">
            <button className="btn btn-light btn-lg" type="button" onClick={history.back}>
              上一步
            </button>
            <SpinBtn className="btn btn-primary btn-lg" type="submit" loading={loading}>
              下一步
            </SpinBtn>
          </div>
        </div>
      </Form>

      <StepsModal id="benefit-modal" property={priority} spRate={spRate} ratio={ratio} onConfirm={handleSteps} />

      <AssetsModal ref={modal} data={model} onConfirm={handleSubmit} />

      {/* <Modal.Alert id="build-modal" title="算力/收益分配方案" confirmText="我知道了">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">新增的存储空间获得的Filecoin奖励，智能合约严格执行分配方案。点击修改按钮调整分配方案。</p>
          </div>
        </div>
      </Modal.Alert>

      <Modal.Alert id="deposit-modal" title="技术运维保证金" confirmText="我知道了">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">
              根据募集目标和分配方案可计算技术运维保证金。技术运维保证金保障节点长期可靠运行，做为劣后资金首先承担Filecoin网络罚金。合理比例会增加募集计划的吸引力，以及未来算力交易中的流动性。
            </p>
          </div>
        </div>
      </Modal.Alert>

      <Modal.Alert id="assets-modal" title={`${model?.minerId}历史资产的归属`} confirmText="我知道了">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">
              检测到 f1234567
              是已经存在的节点，历史资产收益不计入此募集计划，按以下约定独立分配，技术服务商移交Owner权限时对约定比例进行确认（要求技术服务商的收益分成比例不低于10%）。历史资产的质押币100%归属发起人。
            </p>
          </div>
        </div>
      </Modal.Alert> */}
    </>
  );
}
