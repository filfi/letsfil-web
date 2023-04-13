import { ethers } from 'ethers';
import { ScrollSpy } from 'bootstrap';
import { useParams } from '@umijs/max';
import { useMemo, useRef, useState } from 'react';
import { useMount, useRequest, useUpdateEffect } from 'ahooks';

import styles from './styles.less';
import * as F from '@/utils/format';
import * as U from '@/utils/utils';
import { getInfo } from '@/apis/raise';
import Modal from '@/components/Modal';
import { EventType } from '@/utils/mitt';
import Closer from './components/Closer';
import Failed from './components/Failed';
import Signer from './components/Signer';
import Deposit from './components/Deposit';
import Staking from './components/Staking';
import Success from './components/Success';
import Unstaking from './components/Unstaking';
import NodeInfo from './components/NodeInfo';
import TimeInfo from './components/TimeInfo';
import RaiseInfo from './components/RaiseInfo';
import RewardInfo from './components/RewardInfo';
import ShareBtn from '@/components/ShareBtn';
import useAccounts from '@/hooks/useAccounts';
import { RaiseState } from '@/constants/state';
import Breadcrumb from '@/components/Breadcrumb';
import PageHeader from '@/components/PageHeader';
import useLoadingify from '@/hooks/useLoadingify';
import PayforModal from '@/components/PayforModal';
import usePlanAmounts from '@/hooks/usePlanAmounts';
import useEmittHandler from '@/hooks/useEmitHandler';
import usePlanContract from '@/hooks/usePlanContract';
import { ReactComponent as Share4 } from '@/assets/icons/share-04.svg';
import { ReactComponent as Share6 } from '@/assets/icons/share-06.svg';

async function initScrollSpy() {
  return new ScrollSpy(document.querySelector('[data-bs-spy="scroll"]'));
}

export default function Overview() {
  const params = useParams();
  const address = useRef<string>();
  const payfor = useRef<ModalAttrs>(null);
  const unstaking = useRef<ModalAttrs>(null);

  const { accounts } = useAccounts();
  const plan = usePlanContract(address);
  const amounts = usePlanAmounts(address);
  const [planState, setPlanState] = useState(-1);
  const [nodeState, setNodeState] = useState(-1);

  const service = async () => {
    if (params.id) {
      return await getInfo(params.id);
    }

    return undefined;
  };

  const getRaiseState = async () => {
    const raiseState = await plan.getRaiseState();

    console.log('[raiseState]: ', raiseState);

    setPlanState(raiseState ?? -1);
  };

  const getNodeState = async () => {
    const nodeState = await plan.getNodeState();

    console.log('[nodeState]: ', nodeState);

    setNodeState(nodeState ?? -1);
  };

  const { data, refresh } = useRequest(service, { refreshDeps: [params] });

  const onDataChange = () => {
    address.current = data?.raise_address;

    getRaiseState();
    getNodeState();
    amounts.refresh();
  };

  const raiseId = useMemo(() => data?.raising_id, [data]);
  const total = useMemo(() => F.toNumber(data?.target_amount), [data]);
  const isRaiser = useMemo(() => U.isEqual(data?.raiser, accounts[0]), [data, accounts]);

  const onStatusChange = (res: API.Base) => {
    console.log('[onStatusChange]: ', res);

    const raiseID = res.raiseID.toString();

    if (U.isEqual(raiseID, raiseId)) {
      refresh();
    }
  };

  const onWithdrawSuccess = (res: API.Base) => {
    Modal.alert({
      icon: 'success',
      title: '提取成功',
      content: '交易可能会有延迟，请稍后至接收钱包查看',
      confirmText: '我知道了',
    });

    onStatusChange(res);
  };

  useMount(initScrollSpy);
  useUpdateEffect(onDataChange, [data]);
  useEmittHandler({
    [EventType.OnStaking]: onStatusChange,
    [EventType.OnUnstaking]: onWithdrawSuccess,
    [EventType.OnRaiseFailed]: onStatusChange,
    [EventType.OnCloseRaisePlan]: onStatusChange,
    [EventType.OnDepositOPSFund]: onStatusChange,
    [EventType.OnStartRaisePlan]: onStatusChange,
    [EventType.OnWithdrawOPSFund]: onWithdrawSuccess,
    [EventType.OnWithdrawRaiseFund]: onWithdrawSuccess,
  });

  // 关闭计划
  const { loading: closing, run: handleClose } = useLoadingify(async () => {
    await plan.closeRaisePlan();
  });

  // 支付运维保证金
  const { loading: opsLoading, run: handleOpsFund } = useLoadingify(async () => {
    if (!data || !data.ops_security_fund) return;

    await plan.depositOPSFund({
      value: ethers.BigNumber.from(`${data.ops_security_fund}`),
    });
  });

  // 好友代付，修改支付地址
  const { loading: payforing, run: handlePayfor } = useLoadingify(async (address: string) => {
    await plan.specifyOpsPayer(address);

    const url = `${location.origin}/letsfil/payfor/overview/${data?.raiseID ?? ''}`;

    try {
      await navigator.clipboard.writeText(url);

      Modal.alert({ icon: 'success', content: '链接已复制' });
    } catch (e) {}
  });

  // 解除质押|赎回
  const { loading: unstakeLoading, run: handleUnstaking } = useLoadingify(async (amount?: number | string) => {
    await plan.unStaking(ethers.utils.parseEther(`${amount ?? amounts.invest}`));
  });

  const withdrawRaiseFund = async () => {
    await plan.withdrawRaiseFund();
  };

  const withdrawOpsFund = async () => {
    await plan.withdrawOPSFund();
  };

  const renderStatus = () => {
    if (!data) return null;

    const state = (() => {
      switch (planState) {
        case RaiseState.NotStarted: // 未缴纳募集保证金
          break;
        case RaiseState.WaitPayOPSSecurityFund: // 未缴纳运维保证金
          return isRaiser && <Deposit loading={opsLoading} onPayfor={() => payfor.current?.show()} onConfirm={handleOpsFund} />;
        case RaiseState.WaitSeverSign: // 等待服务商签名
          return isRaiser && <Signer raiseID={data?.raising_id} />;
        case RaiseState.InProgress: // 募集中
          return <Staking total={total} raiseID={raiseId} amount={amounts.invest} loading={unstakeLoading} onConfirm={() => unstaking.current?.show()} />;
        case RaiseState.Closed: // 已关闭
        case RaiseState.Failed: // 募集失败
          return (
            <Failed
              state={planState}
              ops={amounts.ops}
              raise={amounts.raise}
              invest={amounts.invest}
              onWithdrawOpsFund={withdrawOpsFund}
              onWithdrawRaiseFund={withdrawRaiseFund}
              onWithdrawInvestFund={handleUnstaking}
            />
          );
        case RaiseState.Successed: // 募集成功
          return (
            <Success
              data={data}
              state={nodeState}
              ops={amounts.ops}
              raise={amounts.raise}
              total={amounts.total}
              invest={amounts.invest}
              usable={amounts.usable}
              onWithdrawOpsFund={withdrawOpsFund}
              onWithdrawRaiseFund={withdrawRaiseFund}
              onWithdrawInvestFund={handleUnstaking}
            />
          );
      }
    })();

    const cloable = isRaiser && planState <= RaiseState.InProgress;

    return (
      <div className="d-flex flex-column gap-4">
        {state}

        {cloable && <Closer loading={closing} onConfirm={handleClose} />}
      </div>
    );
  };

  return (
    <>
      <div className="container">
        <Breadcrumb items={[{ title: '全部募集计划', route: '/letsfil/raising' }, { title: data?.sponsor_company ?? '' }]} />

        <PageHeader title={`FIL募集计划 - ${F.formatNum(total, '0a')} - ${data?.sponsor_company ?? ''}`}>
          <div className="d-flex align-items-center gap-3">
            <ShareBtn className="btn btn-light" text={location.href} toast="链接已复制">
              <Share4 />
            </ShareBtn>
            <button type="button" className="btn btn-light text-nowrap">
              <Share6 />
              <span className="ms-1">查看智能合约</span>
            </button>
          </div>
        </PageHeader>

        <div className={styles.content}>
          <div id="nav-pills" className={styles.tabs}>
            <ul className="nav nav-pills flex-lg-column mb-2">
              <li className="nav-item">
                <a className="nav-link" href="#pledge-plan">
                  质押计划
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#allocation-plan">
                  分配方案
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#build-plan">
                  建设方案
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#timeline">
                  时间进度
                </a>
              </li>
            </ul>
          </div>
          <div className={styles.main} tabIndex={0} data-bs-spy="scroll" data-bs-target="#nav-pills" data-bs-smooth-scroll="true">
            <section id="pledge-plan" className={styles.section}>
              <div className={styles.header}>
                <h4 className={styles.title}>质押计划</h4>
                <p className="mb-0">募集计划的概要</p>
              </div>

              <RaiseInfo data={data} />
            </section>
            <section id="allocation-plan" className={styles.section}>
              <div className={styles.header}>
                <h4 className={styles.title}>分配方案</h4>
                <p className="mb-0">募集计划的分配方案</p>
              </div>

              <RewardInfo data={data} />
            </section>
            <section id="build-plan" className={styles.section}>
              <div className={styles.header}>
                <h4 className={styles.title}>建设方案</h4>
                <p className="mb-0">募集计划的建设方案</p>
              </div>

              <NodeInfo data={data} />
            </section>
            <section id="timeline" className={styles.section}>
              <div className={styles.header}>
                <h4 className={styles.title}>时间进度</h4>
                <p className="mb-0">募集计划的时间进度</p>
              </div>

              <TimeInfo data={data} nodeState={nodeState} planState={planState} />
            </section>
          </div>
          <div className={styles.sidebar}>{renderStatus()}</div>
        </div>
      </div>

      <PayforModal ref={payfor} loading={payforing} onConfirm={handlePayfor} />
      <Unstaking ref={unstaking} amount={amounts.invest} onConfirm={handleUnstaking} />
    </>
  );
}
