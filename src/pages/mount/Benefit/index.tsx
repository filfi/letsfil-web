import { snakeCase } from 'lodash';
import classNames from 'classnames';
import { useMemo, useRef } from 'react';
import { Form, Input, message } from 'antd';
import { history, useModel } from '@umijs/max';
import { useDynamicList, useUpdateEffect } from 'ahooks';

import * as A from '@/apis/raise';
import * as H from '@/helpers/app';
import styles from './styles.less';
import { catchify } from '@/utils/hackify';
import useSProvider from '@/hooks/useSProvider';
import * as validators from '@/utils/validators';
import useLoadingify from '@/hooks/useLoadingify';
import { formatAmount, formatNum } from '@/utils/format';
import { accAdd, accDiv, accMul, accSub, isEqual } from '@/utils/utils';
// import Modal from '@/components/Modal';
import Dialog from '@/components/Dialog';
import OrgTree from '@/components/OrgTree';
import SpinBtn from '@/components/SpinBtn';
import StepsModal from './components/StepsModal';
import { ReactComponent as IconLock } from '@/assets/icons/icon-lock.svg';
import { ReactComponent as IconBorder } from '@/assets/icons/icon-border.svg';

type Values = ReturnType<typeof H.calcEachEarn>;

const defaultTreeData = {
  label: '历史算力',
  rate: 100,
  desc: '以及Filecoin的未来激励',
  children: [
    {
      label: '建设者分成',
      active: true,
      rate: 0,
      desc: '质押方的权益',
      // children: [
      //   {
      //     label: '优先建设者分成',
      //     rate: 0,
      //     desc: '优先质押的权益',
      //   },
      //   {
      //     label: '运维保证金分成',
      //     rate: 0,
      //     locked: true,
      //     desc: '劣后质押的权益',
      //   },
      // ],
    },
    {
      label: '服务方分成',
      rate: 0,
      desc: '服务方的权益',
      children: [
        {
          label: '技术服务商分成',
          rate: 0,
          active: true,
          locked: true,
          desc: '技术服务商的权益',
        },
        {
          label: '主办人分成',
          rate: 0,
          desc: '分配计划的管理人',
        },
        {
          label: 'FilFi协议分成',
          rate: 0,
          locked: true,
          desc: '固定为服务方权益的8%',
        },
      ],
    },
  ],
};

const getTreeData = (priority: number = 70, spRate = 5, ratio = 5) => {
  const data = Object.assign({}, defaultTreeData);
  const vals = H.calcEachEarn(priority, spRate, ratio);

  data.children[0].rate = vals.priority;
  // data.children[0].children[0].rate = vals.investRate;
  // data.children[0].children[1].rate = vals.opsRate;
  data.children[1].rate = vals.inferior;
  data.children[1].children![0].rate = vals.spRate;
  data.children[1].children![1].rate = vals.raiserRate;
  data.children[1].children![2].rate = vals.ffiRate;

  return data;
};

export default function MountBenefit() {
  const modal = useRef<ModalAttrs>(null);

  const [model, setModel] = useModel('stepform');
  const provider = useSProvider(model?.serviceId);

  const [form] = Form.useForm();
  const spRate = Form.useWatch('opServerShare', form);
  const priority = Form.useWatch('raiserCoinShare', form);
  const ratio = Form.useWatch('opsSecurityFundRate', form);

  const balance = useMemo(() => model?.hisBlance ?? 0, [model]);
  const pieVal = useMemo(() => (Number.isNaN(+ratio) ? 0 : +ratio), [ratio]);
  const priorityRate = useMemo(() => Math.max(accSub(100, pieVal), 0), [pieVal]);
  const available = useMemo(() => accMul(balance, accDiv(priority, 100)), [balance, priority]);
  const treeData = useMemo(() => getTreeData(priority, spRate, pieVal), [priority, spRate, pieVal]);

  const { list: investors, getKey, ...handles } = useDynamicList<API.Base>([{ address: '', amount: '', rate: '' }]);

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

  const validateInvestors = (list: API.Base[]) => {
    if (!Array.isArray(list)) {
      message.error('请添加建设者');
      return false;
    }

    if (list.reduce((sum, { rate }) => accAdd(sum, rate), 0) > priority) {
      message.error(`建设者分成比例累加不能超过${priority}%`);
      return false;
    }

    return true;
  };

  const [loading, handleSubmit] = useLoadingify(async (vals?: API.Base) => {
    const data = vals ?? model;

    if (!data || !validateInvestors(data.investors)) return;

    let raiseId = data.raisingId;
    const params = H.transformParams(data);
    const { investors, ...body } = Object.keys(params).reduce(
      (d, key) => ({
        ...d,
        [snakeCase(key)]: params[key as keyof typeof params],
      }),
      {} as API.Base,
    );

    const [e] = await catchify(async () => {
      if (raiseId) {
        await A.update(raiseId, body);
        await A.updateEquity(raiseId, {
          sponsor_equities: [],
          investor_equities: investors.map((i: API.Base) => ({
            ...H.transformInvestor(i),
            raise_id: raiseId,
          })),
        });
      } else {
        raiseId = H.genRaiseID(data.minerId).toString();
        await A.add({ ...body, raising_id: raiseId });
        await A.addEquity(raiseId, {
          sponsor_equities: [],
          investor_equities: investors.map((i: API.Base) => ({
            ...H.transformInvestor(i),
            raise_id: raiseId,
          })),
        });
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

    history.push(`/mount/result/${raiseId.toString()}`);
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
            <h4 className="ffi-label">质押归属</h4>
            <p className="text-gray">
              历史节点的质押全部归属建设者，不可调整。
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

            <div className="row">
              <div className="col-12 col-md-8 col-lg-6">
                <p className="mb-1 fw-500">优先质押</p>
                <Form.Item>
                  <Input
                    className="bg-light text-end"
                    suffix="%"
                    readOnly
                    prefix={
                      <div>
                        <span className="bi bi-people align-middle text-primary"></span>
                        <span className="ms-2 text-gray-dark">建设者</span>
                      </div>
                    }
                    value={priorityRate}
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          <div className="ffi-item">
            <h4 className="ffi-label">分配方案</h4>
            <p className="text-gray">
              主办人根据历史节点原来的利益结构，在FilFi协议上定义分配方案。（算力分配即收益分配，质押的分配已在前一项确定）
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
                <OrgTree data={treeData} className={styles.tree} renderContent={renderTreeContent} />
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
                      <span className="align-middle ms-2">需要主办人填写的比例，其他比例自动计算</span>
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

          <div className="ffi-item">
            <h4 className="ffi-label">建设者详细分配</h4>
            <p className="text-gray">
              建设者的算力和质押分配给多个地址。点击+号增加地址。所有建设者的质押累加等于节点的质押总额，所有建设者算力分配比例累加等于“分配方案”中定义的分成比例。
            </p>

            <p className="fw-500">
              将 <span className="fw-bold">{priority}%</span> 算力和 <span className="fw-bold">{formatAmount(available)} FIL</span> 质押分配给以下地址
            </p>
            <p className="text-end">
              <button className="btn btn-light" type="button" onClick={() => handles.push({ address: '', amount: '', rate: '' })}>
                <span className="bi bi-plus-lg"></span>
                <span className="ms-1">添加建设者</span>
              </button>
            </p>

            <ul className="list-unstyled">
              {investors.map((item, idx) => (
                <li key={getKey(idx)} className="ps-3 pt-3 pe-5 mb-3 bg-light rounded-3 position-relative">
                  <Form.Item
                    name={['investors', getKey(idx), 'address']}
                    initialValue={item.address}
                    rules={[{ required: true, message: '请输入建设者钱包地址' }, { validator: validators.address }]}
                  >
                    <Input placeholder="输入建设者地址" />
                  </Form.Item>
                  <div className="row g-0">
                    <div className="col-12 col-md-8 pe-lg-3">
                      <Form.Item
                        name={['investors', getKey(idx), 'amount']}
                        initialValue={item.amount}
                        rules={[
                          { required: true, message: '请输入持有质押数量' },
                          { validator: validators.createNumRangeValidator([0, available], `请输入0-${available}之间的数`) },
                        ]}
                      >
                        <Input type="number" min={0} max={available} placeholder="输入持有质押数量" suffix="FIL" />
                      </Form.Item>
                    </div>
                    <div className="col-12 col-md-4">
                      <Form.Item
                        name={['investors', getKey(idx), 'rate']}
                        initialValue={item.rate}
                        rules={[
                          { required: true, message: '请输入算力分配比例' },
                          { validator: validators.createNumRangeValidator([0, priority], `请输入0-${priority}之间的数`) },
                        ]}
                      >
                        <Input type="number" min={0} max={priority} placeholder="输入算力分配比例" suffix="%" />
                      </Form.Item>
                    </div>
                  </div>

                  {investors.length > 1 && (
                    <button className="btn-close position-absolute end-0 top-0 me-3 mt-3" type="button" onClick={() => handles.remove(idx)}></button>
                  )}
                </li>
              ))}
            </ul>

            <p>
              <span className="me-1">共 {investors.length} 地址</span>
              <span className="text-danger">分配比例累加不能超过{priority}%</span>
            </p>
          </div>
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
    </>
  );
}
