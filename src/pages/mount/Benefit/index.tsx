import dayjs from 'dayjs';
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
import { accAdd, accSub, isEqual, sleep, toEthAddr } from '@/utils/utils';
import { formatAmount, formatNum, toFixed, toNumber } from '@/utils/format';
import Dialog from '@/components/Dialog';
import OrgTree from '@/components/OrgTree';
import SpinBtn from '@/components/SpinBtn';
import StepsModal from './components/StepsModal';
import SponsorList from './components/SponsorList';
import InvestorList from './components/InvestorList';
import type { SponsorListActions } from './components/SponsorList';
import type { InvestorListActions, InvestorItem } from './components/InvestorList';
import { ReactComponent as IconLock } from '@/assets/icons/icon-lock.svg';
import { ReactComponent as IconBorder } from '@/assets/icons/icon-border.svg';

type Values = ReturnType<typeof H.calcEachEarn>;

const defaultTreeData = {
  label: '歷史算力',
  rate: 100,
  desc: '以及Filecoin的未來激勵',
  children: [
    {
      label: '建設者分成',
      active: true,
      rate: 0,
      desc: '質押方的權益',
      // children: [
      //   {
      //     label: '優先建設者分成',
      //     rate: 0,
      //     desc: '優先質押的權益',
      //   },
      //   {
      //     label: '運維保證金分成',
      //     rate: 0,
      //     locked: true,
      //     desc: '劣後質押的權益',
      //   },
      // ],
    },
    {
      label: '服務方分成',
      rate: 0,
      desc: '服務方的權益',
      children: [
        {
          label: '技術服務商分成',
          rate: 0,
          active: true,
          locked: true,
          desc: '技術服務商的權益',
        },
        {
          label: '主辦人分成',
          rate: 0,
          desc: '分配計劃的管理人',
        },
        {
          label: 'FilFi協議分成',
          rate: 0,
          locked: true,
          desc: '固定為服務方權益的8%',
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
  const sponsor = useRef<SponsorListActions>(null);
  const investor = useRef<InvestorListActions>(null);

  const [model, setModel] = useModel('stepform');
  const provider = useSProvider(model?.serviceId);

  const [form] = Form.useForm();
  const _sponsors = Form.useWatch('sponsors', form);
  const _investors = Form.useWatch('investors', form);
  const spRate = Form.useWatch('opServerShare', form);
  const priority = Form.useWatch('raiserCoinShare', form);
  const ratio = Form.useWatch('opsSecurityFundRate', form);

  const { data } = useMinerInfo(model?.minerId);
  const balance = useMemo(() => +toFixed(toNumber(data?.initial_pledge), 5), [data]);
  const pieVal = useMemo(() => (Number.isNaN(+ratio) ? 0 : +ratio), [ratio]);
  const priorityRate = useMemo(() => Math.max(accSub(100, pieVal), 0), [pieVal]);
  const treeData = useMemo(() => getTreeData(priority, spRate, pieVal), [priority, spRate, pieVal]);
  const sponsors = useMemo(() => (Array.isArray(_sponsors) ? _sponsors.filter(Boolean) : []), [_sponsors]);
  const investors = useMemo(() => (Array.isArray(_investors) ? _investors.filter(Boolean) : []), [_investors]);
  const raserRate = useMemo(() => H.calcEachEarn(priority, spRate, ratio).raiserRate, [priority, spRate, ratio]);

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
        title: `${action}分配方案會清空已填入詳細分配比例`,
        summary: `建設者和主辦人的詳細分配比例，依賴“分配方案”中定義的比例。${action}“分配方案”中的任何比例，會自動清空已填寫的詳細分配比例。`,
        content: '是否继续？',
        confirmText: isReset ? '確認重置' : '繼續修改',
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
      sponsors: [],
      investors: [],
      opServerShare: 5,
      raiserCoinShare: 70,
    });
    sponsor?.current?.reset();
    investor.current?.reset(getInitInvestors());
  }, true);

  const handleEdit = withWarning(async () => {
    form.setFieldsValue({
      sponsors: [],
      investors: [],
    });

    sponsor.current?.reset();
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

  const showErr = (content: string, title: string) => {
    Dialog.error({ content, title });
  };

  const validateEquity = (list: API.Base[], isInvestor = false) => {
    const role = isInvestor ? '建設者' : '主辦人';
    const title = `${role}詳細分配`;

    if (!Array.isArray(list) || !list.length) {
      showErr(`請新增${role}`, title);
      return false;
    }

    const items = list.filter(Boolean).map(({ address }) => toEthAddr(address).toLowerCase());

    if (new Set(items).size !== items.length) {
      showErr(`${role}錢包地址不能重複`, title);
      return false;
    }

    if (isInvestor) {
      const sum = list.filter(Boolean).reduce((s, { amount }) => accAdd(s, amount), 0);
      if (sum !== balance) {
        showErr(`${role}持有質押幣累加必須精確等於${formatAmount(balance, 5)}`, title);
        return false;
      }
    }

    const rate = isInvestor ? priority : raserRate;
    if (list.filter(Boolean).reduce((sum, { rate }) => accAdd(sum, rate), 0) !== Number(rate)) {
      showErr(`${role}分成比例累加必須精確等於${rate}%`, title);
      return false;
    }

    return true;
  };

  const [loading, handleSubmit] = useLoadingify(async (data: API.Base) => {
    let raiseId = data.raisingId;
    const isEdit = !!raiseId;
    const { beginTime, ...params }: API.Base = H.transformParams(data);
    const { sponsors, investors, ...body } = Object.keys(params).reduce(
      (d, key) => ({
        ...d,
        [snakeCase(key)]: params[key as keyof typeof params],
      }),
      {} as API.Base,
    );

    if (!isEdit) {
      raiseId = H.genRaiseID(data.minerId).toString();
    }

    if (beginTime) {
      body.begin_time = dayjs(beginTime).unix();
    }

    const _sponsors = sponsors.filter(Boolean).map((i: API.Base) => ({
      ...H.transformSponsor(i),
      raise_id: raiseId,
    }));

    const _investors = investors.filter(Boolean).map((i: API.Base) => ({
      ...H.transformInvestor(i),
      raise_id: raiseId,
    }));

    delete body.raiseWhiteList;

    const [e] = await catchify(async () => {
      if (isEdit) {
        await A.update(raiseId, body);
        await A.updateEquity(raiseId, { sponsor_equities: _sponsors, investor_equities: _investors });
      } else {
        await A.add({ ...body, raising_id: raiseId });
        await A.addEquity(raiseId, { sponsor_equities: _sponsors, investor_equities: _investors });
      }
    })();

    if (e) {
      Dialog.alert({
        icon: 'error',
        title: '提交失敗',
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

    const { sponsors, investors } = data;

    if (!validateEquity(sponsors)) return;

    if (!validateEquity(investors, true)) return;

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
            <h4 className="ffi-label">質押歸屬</h4>
            <p className="text-gray">
              歷史節點的質押全歸屬建設者，不可調整。
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
                <p className="mb-1 fw-500">優先質押</p>
                <Form.Item>
                  <Input
                    className="bg-light text-end"
                    suffix="%"
                    readOnly
                    prefix={
                      <div>
                        <span className="bi bi-people align-middle text-primary"></span>
                        <span className="ms-2 text-gray-dark">建設者</span>
                      </div>
                    }
                    value={priorityRate}
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          <div className="ffi-item border-bottom">
            <h4 className="ffi-label">分配方案</h4>
            <p className="text-gray">
              主辦人根據歷史節點原來的利益結構，在FilFi協定上定義分配方案。（算力分配即收益分配，質押的分配已在前一項確定）
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
                      <span className="align-middle ms-2">加鎖的權益永久鎖定，未來不可交易</span>
                    </p>
                    <p className="text-gray mb-1">
                      <IconBorder />
                      <span className="align-middle ms-2">需要主辦人填寫的比例，其他比例自動計算</span>
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

          <div className="ffi-form border-bottom">
            <div className="ffi-item">
              <h4 className="ffi-label">主辦人詳細分配</h4>
              <p className="mb-3 text-gray">
                主辦人的權益可再分配給多個地址。點擊+號增加地址。第一個地址為第一主辦人，不可刪減，其分配比例自動計算。
              </p>

              <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3 mb-3">
                <p className="mb-0 me-sm-auto">將 {raserRate}% 分配給以下地址</p>

                <button
                  className="btn btn-light btn-lg"
                  type="button"
                  disabled={sponsors.length >= 20}
                  onClick={() => sponsor.current?.add()}
                >
                  <span className="bi bi-plus-lg"></span>
                  <span className="ms-2">新增主辦人</span>
                </button>
              </div>

              <SponsorList ref={sponsor} form={form} max={raserRate} name="sponsors" />

              <p>
                <span className="me-1">共 {sponsors.length} 地址</span>
                <span className="text-danger">算力分配比例累加要精確等於{raserRate}%</span>
              </p>
            </div>
          </div>

          <div className="ffi-item">
            <h4 className="ffi-label">建設者詳細分配</h4>
            <p className="text-gray">
              建設者的算力和質押分配給多個地址。 點擊+號增加地址。
              所有建造者的質押累加等於節點的質押總額，所有建造者算力分配比例累加等於“分配方案”中定義的分成比例。
            </p>

            <p className="fw-500">
              將 <span className="fw-bold">{priority}%</span> 算力和{' '}
              <span className="fw-bold">{formatAmount(balance, 5)} FIL</span> 质押分配给以下地址
            </p>
            <p className="text-end">
              <button
                className="btn btn-light"
                type="button"
                disabled={investors.length >= 50}
                onClick={() => investor.current?.add()}
              >
                <span className="bi bi-plus-lg"></span>
                <span className="ms-1">新增建設者</span>
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
