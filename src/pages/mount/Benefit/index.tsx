import { Modal } from 'bootstrap';
import { parseEther } from 'viem';
import { snakeCase } from 'lodash';
import { Form, Input } from 'antd';
import classNames from 'classnames';
import { history, useModel } from '@umijs/max';
import { useEffect, useMemo, useRef } from 'react';

import * as A from '@/apis/raise';
import * as H from '@/helpers/app';
import styles from './styles.less';
import { catchify } from '@/utils/hackify';
import useMinerInfo from '@/hooks/useMinerInfo';
import useSProvider from '@/hooks/useSProvider';
import useLoadingify from '@/hooks/useLoadingify';
import { accAdd, accSub, isEqual, sleep } from '@/utils/utils';
import { formatAmount, formatNum, toFixed, toNumber } from '@/utils/format';
// import Modal from '@/components/Modal';
import Dialog from '@/components/Dialog';
import OrgTree from '@/components/OrgTree';
import SpinBtn from '@/components/SpinBtn';
import StepsModal from './components/StepsModal';
import InvestorList from './components/InvestorList';
import type { InvestorListActions, InvestorItem } from './components/InvestorList';
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

const getInitInvestors = (items?: InvestorItem[]) => {
  if (Array.isArray(items)) {
    return items.filter(Boolean);
  }

  return [{ address: '', amount: '', rate: '' }];
};

export default function MountBenefit() {
  const modal = useRef<ModalAttrs>(null);
  const investor = useRef<InvestorListActions>(null);

  const [model, setModel] = useModel('stepform');
  const provider = useSProvider(model?.serviceId);

  const [form] = Form.useForm();
  const _investors = Form.useWatch('investors', form);
  const spRate = Form.useWatch('opServerShare', form);
  const priority = Form.useWatch('raiserCoinShare', form);
  const ratio = Form.useWatch('opsSecurityFundRate', form);

  const { data } = useMinerInfo(model?.minerId);
  const balance = useMemo(() => +toFixed(toNumber(data?.initial_pledge), 7), [data]);
  const pieVal = useMemo(() => (Number.isNaN(+ratio) ? 0 : +ratio), [ratio]);
  const priorityRate = useMemo(() => Math.max(accSub(100, pieVal), 0), [pieVal]);
  const treeData = useMemo(() => getTreeData(priority, spRate, pieVal), [priority, spRate, pieVal]);
  const investors = useMemo(() => (Array.isArray(_investors) ? _investors.filter(Boolean) : []), [_investors]);

  useEffect(() => {
    form.setFieldValue('hisInitialPledge', parseEther(`${balance}`).toString());
  }, [balance]);
  useEffect(() => {
    if (provider) {
      form.setFieldValue('opsSecurityFundAddr', provider?.wallet_address);
    }
  }, [provider]);

  function withWarning<P extends unknown[] = any>(handle: (...args: P) => void, isReset?: boolean) {
    return (...args: P) => {
      const action = isReset ? '重置' : '修改';

      const hide = Dialog.confirm({
        icon: 'error',
        title: `${action}分配方案会清空已填写详细分配比例`,
        summary: `建设者和主办人的详细分配比例，依赖“分配方案”中定义的比例。${action}“分配方案”中的任何比例，会自动清空已填写的详细分配比例。`,
        content: '是否继续？',
        confirmText: isReset ? '确认重置' : '继续修改',
        confirmBtnVariant: 'danger',
        onConfirm: () => {
          hide();

          handle(...args);
        },
      });
    };
  }

  const handleReset = withWarning(() => {
    form.setFieldsValue({
      investors: [],
      opServerShare: 5,
      raiserCoinShare: 70,
    });
    investor.current?.reset(getInitInvestors());
  }, true);

  const handleEdit = withWarning(async () => {
    form.setFieldValue('investors', []);
    investor.current?.reset(getInitInvestors());

    await sleep(300);

    const modal = Modal.getOrCreateInstance('#benefit-modal');

    modal && modal.show();
  });

  const handleSteps = ({ priority, spRate }: Values) => {
    form.setFieldsValue({
      opServerShare: spRate,
      raiserCoinShare: priority,
    });
  };

  const showErr = (content: string, title = '建设者详细分配') => {
    Dialog.error({ content, title });
  };

  const validateInvestors = (list: API.Base[]) => {
    if (!Array.isArray(list)) {
      showErr('请添加建设者');
      return false;
    }

    const items = list.filter(Boolean).reduce((prev, { address }) => {
      const key = `${address}`.toLowerCase();

      if (prev[key]) {
        prev[key] += 1;
      } else {
        prev[key] = 1;
      }

      return prev;
    }, {});

    if (Object.keys(items).some((key) => items[key] > 1)) {
      showErr('钱包地址不能重复');
      return false;
    }

    if (list.filter(Boolean).reduce((sum, { amount }) => accAdd(sum, amount), 0) !== balance) {
      showErr(`建设者持有质押币累加必须精确等于${formatAmount(balance, 7)}`);
      return false;
    }

    if (list.filter(Boolean).reduce((sum, { rate }) => accAdd(sum, rate), 0) !== +priority) {
      showErr(`建设者分成比例累加必须精确等于${priority}%`);
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
          investor_equities: investors.filter(Boolean).map((i: API.Base) => ({
            ...H.transformInvestor(i),
            raise_id: raiseId,
          })),
        });
      } else {
        raiseId = H.genRaiseID(data.minerId).toString();
        await A.add({ ...body, raising_id: raiseId });
        await A.addEquity(raiseId, {
          sponsor_equities: [],
          investor_equities: investors.filter(Boolean).map((i: API.Base) => ({
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
          <span className="ms-lg-2 fw-bold">{formatNum(data.rate, '0.00000')}%</span>
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

            <Form.Item hidden name="hisInitialPledge">
              <Input />
            </Form.Item>
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
                      <button className="btn btn-primary btn-lg flex-fill" type="button" onClick={handleEdit}>
                        修改
                      </button>
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
              将 <span className="fw-bold">{priority}%</span> 算力和 <span className="fw-bold">{formatAmount(balance, 7)} FIL</span> 质押分配给以下地址
            </p>
            <p className="text-end">
              <button className="btn btn-light" type="button" disabled={investors.length >= 50} onClick={() => investor.current?.add()}>
                <span className="bi bi-plus-lg"></span>
                <span className="ms-1">添加建设者</span>
              </button>
            </p>

            <InvestorList ref={investor} name="investors" max={balance} rateMax={priority} />

            <p>
              <span className="me-1">共 {investors.length} 地址</span>
              <span className="text-danger">分配比例累加必须精确等于{priority}%</span>
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
