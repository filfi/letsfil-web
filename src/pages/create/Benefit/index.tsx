import dayjs from 'dayjs';
import { Modal } from 'bootstrap';
import { snakeCase } from 'lodash';
import { Form, Input } from 'antd';
import classNames from 'classnames';
import { useUpdateEffect } from 'ahooks';
import { history, useModel } from '@umijs/max';
import { useEffect, useMemo, useRef } from 'react';

import * as A from '@/apis/raise';
import * as H from '@/helpers/app';
import styles from './styles.less';
// import Modal from '@/components/Modal';
import Avatar from '@/components/Avatar';
import Dialog from '@/components/Dialog';
import OrgTree from '@/components/OrgTree';
import SpinBtn from '@/components/SpinBtn';
import { catchify } from '@/utils/hackify';
import useSProvider from '@/hooks/useSProvider';
import BenefitPie from './components/BenefitPie';
import StepsModal from './components/StepsModal';
import AssetsModal from './components/AssetsModal';
import useLoadingify from '@/hooks/useLoadingify';
import { createNumRangeValidator } from '@/utils/validators';
import SponsorList, { SponsorListActions } from './components/SponsorList';
import { formatAddr, formatEther, formatNum, toFixed } from '@/utils/format';
import { accAdd, accDiv, accMul, accSub, isEqual, sleep, toEthAddr } from '@/utils/utils';
import { ReactComponent as IconLock } from '@/assets/icons/icon-lock.svg';
import { ReactComponent as IconBorder } from '@/assets/icons/icon-border.svg';

type Values = ReturnType<typeof H.calcEachEarn>;

const defaultTreeData = {
  label: '封裝算力',
  rate: 100,
  desc: 'Filecoin激勵',
  children: [
    {
      label: '建設者分成',
      active: true,
      rate: 0,
      desc: '質押方的權益',
      // children: [
      //   {
      //     label: '优先建設者分成',
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
          label: '技術運維服務費',
          rate: 0,
          active: true,
          locked: true,
          desc: '技術服務商的權益',
        },
        {
          label: '主辦人分成',
          rate: 0,
          desc: '節點計劃的管理人',
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

export default function CreateBenefit() {
  const modal = useRef<ModalAttrs>(null);
  const sponsor = useRef<SponsorListActions>(null);

  const [form] = Form.useForm();
  const [model, setModel] = useModel('stepform');
  const provider = useSProvider(model?.serviceId);

  const _sponsors = Form.useWatch('sponsors', form);
  const spRate = Form.useWatch('opServerShare', form);
  const priority = Form.useWatch('raiserCoinShare', form);
  const ratio = Form.useWatch('opsSecurityFundRate', form);
  const powerRate = Form.useWatch('raiseHisPowerRate', form);
  const pledgeRate = Form.useWatch('raiseHisInitialPledgeRate', form);

  const pieVal = useMemo(() => (Number.isNaN(+ratio) ? 0 : +ratio), [ratio]);
  const priorityRate = useMemo(() => Math.max(accSub(100, pieVal), 0), [pieVal]);
  const treeData = useMemo(() => getTreeData(priority, spRate, pieVal), [priority, spRate, pieVal]);
  const sponsors = useMemo(() => (Array.isArray(_sponsors) ? _sponsors.filter(Boolean) : []), [_sponsors]);
  const raserRate = useMemo(() => H.calcEachEarn(priority, spRate, ratio).raiserRate, [priority, spRate, ratio]);
  const servicerPowerRate = useMemo(
    () => Math.max(accSub(100, Number.isNaN(+powerRate) ? 0 : +powerRate), 0),
    [powerRate],
  );
  const servicerPledgeRate = useMemo(
    () => Math.max(accSub(100, Number.isNaN(+pledgeRate) ? 0 : +pledgeRate), 0),
    [pledgeRate],
  );
  const spName = useMemo(() => provider?.full_name || formatAddr(provider?.wallet_address), [provider]);

  useEffect(() => {
    const target = model?.targetAmount ?? 0;
    // 实际保证金配比：运维保证金配比 = 运维保证金 / (运维保证金 + 已质押金额)
    const amount = accDiv(accMul(target, accDiv(pieVal, 100)), accSub(1, accDiv(pieVal, 100)));

    form.setFieldValue('opsSecurityFund', Number.isNaN(amount) ? 0 : toFixed(amount, 2, 2));
  }, [model?.targetAmount, pieVal]);

  useUpdateEffect(() => {
    if (provider) {
      form.setFieldValue('opsSecurityFundAddr', provider?.wallet_address);
    }
  }, [provider]);

  if (!(window as any).form) Object.defineProperty(window, 'form', { value: form });

  function withWarning<P extends unknown[] = any>(handle: (...args: P) => void, isReset?: boolean) {
    return (...args: P) => {
      const action = isReset ? '重置' : '修改';

      const hide = Dialog.confirm({
        icon: 'error',
        title: `${action}分配方案會清空已填入詳細分配比例`,
        summary: `建設者和主辦人的詳細分配比例，依賴“分配方案”中定義的比例。${action}“分配方案”中的任何比例，會自動清空已填寫的詳細分配比例。`,
        content: '是否繼續？',
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
      opServerShare: 5,
      raiserCoinShare: 70,
    });
    sponsor.current?.reset();
  }, true);

  const handleEdit = withWarning(async () => {
    form.setFieldsValue({
      sponsors: [],
    });

    sponsor.current?.reset();

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

  const validateEquity = (list: API.Base[]) => {
    const title = '主辦人詳細分配';

    if (!Array.isArray(list) || !list.length) {
      showErr('請新增主辦人', title);
      return false;
    }

    const items = list.filter(Boolean).map(({ address }) => toEthAddr(address).toLowerCase());

    if (new Set(items).size !== items.length) {
      showErr('主辦人錢包地址不能重複', title);
      return false;
    }

    if (list.filter(Boolean).reduce((sum, { rate }) => accAdd(sum, rate), 0) !== Number(raserRate)) {
      showErr(`主辦人算力分配比例累加要精確等於${raserRate}%`, title);
      return false;
    }

    return true;
  };

  const [loading, handleSubmit] = useLoadingify(async (vals?: API.Base) => {
    const data = vals ?? model;

    if (!data) return;

    let raiseId = data.raisingId;
    const isEdit = !!raiseId;
    const { beginTime, raiseWhiteList, ...params }: API.Base = H.transformParams(data);
    const { sponsors, ...body } = Object.keys(params).reduce(
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

    if (Array.isArray(raiseWhiteList)) {
      body.raise_white_list = JSON.stringify(
        raiseWhiteList.filter(Boolean).map((i: API.Base) => ({
          ...H.transformWhitelist(i),
          raise_id: raiseId,
        })),
      );
    }

    const _sponsors = sponsors.filter(Boolean).map((i: API.Base) => ({
      ...H.transformSponsor(i),
      raise_id: raiseId,
    }));

    delete body.investors;

    console.log('[post data]: ', body);

    const [e] = await catchify(async () => {
      if (isEdit) {
        await A.update(raiseId, body);
        await A.updateEquity(raiseId, { investor_equities: [], sponsor_equities: _sponsors });
      } else {
        await A.add({ ...body, raising_id: raiseId });
        await A.addEquity(raiseId, { investor_equities: [], sponsor_equities: _sponsors });
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

    const { sponsors } = data;

    if (!validateEquity(sponsors)) return;

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
            <h4 className="ffi-label">運維保證金</h4>
            <p className="text-gray">
              主辦人要求技術服務商存入保證金，保證金將做為劣後質押，與建造者的質押一起封裝到儲存節點，優先承擔Filecoin網路罰金。保證金佔質押的比例不低於5%，提高佔比要求，可提高對建設者的吸引力。
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
                <div className="mb-1 fw-500">劣後質押(運維保證金)</div>
                <Form.Item
                  name="opsSecurityFundRate"
                  rules={[
                    { required: true, message: '請輸入' },
                    { validator: createNumRangeValidator([5, 100], '最小5%， 最大100%') },
                  ]}
                >
                  <Input
                    className="text-end"
                    type="number"
                    min={5}
                    max={100}
                    prefix={
                      <div className="d-flex">
                        <Avatar address={provider?.wallet_address} size={24} src={provider?.logo_url} />
                        <span className="ms-1 text-gray-dark">{spName}</span>
                      </div>
                    }
                    suffix="%"
                    placeholder="請輸入"
                  />
                </Form.Item>

                <div className="mb-1 fw-500">優先質押</div>
                <Form.Item noStyle>
                  <Input
                    className="bg-light text-end"
                    suffix="%"
                    readOnly
                    prefix={
                      <div>
                        <span className="bi bi-people align-middle"></span>
                        <span className="ms-2 text-gray-dark">建設者</span>
                      </div>
                    }
                    value={priorityRate}
                  />
                </Form.Item>
              </div>
              <div className="col pt-3">
                <BenefitPie name={spName} value={pieVal} />
              </div>
            </div>
          </div>

          <div className="ffi-item">
            <h4 className="ffi-label">節點激勵/算力分配方案</h4>
            <p className="text-gray">
              新增儲存算力獲得的節點激勵，智慧合約嚴格執行分配方案。算力產生節點激勵，在分配方案中兩者都是等價概念。點選修改按鈕調整分配方案
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

          {model && isEqual(model?.minerType, 2) && (
            <>
              <div className="border-top my-4" />

              <div className="ffi-item">
                <h4 className="ffi-label">{model.minerId}歷史資產的歸屬</h4>
                <p className="text-gray">
                  檢測到 {model.minerId}{' '}
                  是已經存在的節點，歷史資產節點激勵不計入此節點計劃，按以下約定獨立分配，技術服務商移交Owner權限時對約定比例進行確認（要求技術服務商的節點激勵分成比例不低於10%）。歷史資產的質押100%歸屬主辦人。
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
                      <p className="mb-0 text-gray-dark">質押</p>
                    </div>
                    <div className="col">
                      <p className="mb-0 fw-500">{formatEther(model.hisBlance)} FIL</p>
                      <p className="mb-0 text-gray-dark">餘額（含線性釋放）</p>
                    </div>
                    <div className="col">
                      <p className="mb-0 fw-500">{model.hisSectorCount} 个</p>
                      <p className="mb-0 text-gray-dark">扇區數量</p>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column flex-lg-row gap-3 gap-lg-4 mb-4 ps-4 ps-lg-0 position-relative">
                  <div className="flex-full">
                    <Form.Item
                      name="raiseHisPowerRate"
                      rules={[
                        { required: true, message: '請輸入' },
                        { validator: createNumRangeValidator([0, 100], '最小0%，最大100%') },
                      ]}
                    >
                      <Input
                        className="text-end"
                        type="number"
                        min={0}
                        max={100}
                        prefix={<span className="text-gray-dark">我的算力</span>}
                        suffix="%"
                        placeholder="請輸入"
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
                          <Avatar address={provider?.wallet_address} size={24} src={provider?.logo_url} />
                          <span className="ms-1 text-gray-dark">{provider?.full_name}</span>
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
                      <Input
                        className="bg-light text-end"
                        readOnly
                        prefix={<span className="text-gray-dark">我的質押</span>}
                        suffix="%"
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
                          <Avatar address={provider?.wallet_address} size={24} src={provider?.logo_url} />
                          <span className="ms-1 text-gray-dark">{provider?.full_name}</span>
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

        <div className="ffi-form">
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

      {/* <Modal.Alert id="build-modal" title="算力/節點激勵分配方案" confirmText="我知道了">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">新增的儲存空間獲得的Filecoin獎勵，智慧合約嚴格執行分配方案。點選修改按鈕調整分配方案。</p>
          </div>
        </div>
      </Modal.Alert>

      <Modal.Alert id="deposit-modal" title="運維保證金" confirmText="我知道了">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">
              依質押目標和分配方案可計算出運維保證金。運維保證金保障節點長期可靠運行，做為劣後資金先承擔Filecoin網路罰金。合理比例會增加節點計畫的吸引力，以及未來算力交易的流動性。
            </p>
          </div>
        </div>
      </Modal.Alert>

      <Modal.Alert id="assets-modal" title={`${model?.minerId}歷史資產的歸屬`} confirmText="我知道了">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">
              檢測到 f1234567
              是已經存在的節點，歷史資產節點激勵不計入此節點計劃，按以下約定獨立分配，技術服務商移交Owner權限時對約定比例進行確認（要求技術服務商的節點激勵分成比例不低於10%）。歷史資產的質押100%歸屬主辦人。
            </p>
          </div>
        </div>
      </Modal.Alert> */}
    </>
  );
}
