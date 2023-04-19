import { ScrollSpy } from 'bootstrap';
import { useParams } from '@umijs/max';
import { useMemo, useState } from 'react';
import { useMemoizedFn, useRequest, useUpdateEffect } from 'ahooks';

import styles from './styles.less';
import * as F from '@/utils/format';
import * as U from '@/utils/utils';
import { getInfo } from '@/apis/raise';
import { SCAN_URL } from '@/constants';
import Modal from '@/components/Modal';
import { EventType } from '@/utils/mitt';
import Closer from './components/Closer';
import Failed from './components/Failed';
import Signer from './components/Signer';
import Deposit from './components/Deposit';
import Staking from './components/Staking';
import Success from './components/Success';
import NodeInfo from './components/NodeInfo';
import TimeInfo from './components/TimeInfo';
import RaiseInfo from './components/RaiseInfo';
import RewardInfo from './components/RewardInfo';
import StatInfo from './components/StatInfo';
import ShareBtn from '@/components/ShareBtn';
import useAccounts from '@/hooks/useAccounts';
import { RaiseState } from '@/constants/state';
import usePlanState from '@/hooks/usePlanState';
import Breadcrumb from '@/components/Breadcrumb';
import PageHeader from '@/components/PageHeader';
import useEmittHandler from '@/hooks/useEmitHandler';
import { ReactComponent as Share4 } from '@/assets/icons/share-04.svg';
import { ReactComponent as Share6 } from '@/assets/icons/share-06.svg';

function updateScrollSpy() {
  const el = document.querySelector('[data-bs-spy="scroll"]');

  if (el) {
    const spy = ScrollSpy.getOrCreateInstance(el);

    spy.refresh();
  }
}

export default function Overview() {
  const params = useParams();

  const { accounts } = useAccounts();
  const [address, setAddress] = useState<string>();
  const { planState } = usePlanState(address);

  const service = async () => {
    if (params.id) {
      return await getInfo(params.id);
    }

    return undefined;
  };

  const { data, refresh } = useRequest(service, { refreshDeps: [params] });

  const raiseId = useMemo(() => data?.raising_id, [data]);
  const total = useMemo(() => F.toNumber(data?.target_amount), [data]);
  const isRaiser = useMemo(() => U.isEqual(data?.raiser, accounts[0]), [data, accounts]);
  const isPayer = useMemo(() => U.isEqual(data?.ops_security_fund_address, accounts[0]), [data, accounts]);

  const onDataChange = () => {
    setAddress(data?.raise_address);
  };

  const onStatusChange = useMemoizedFn((res: API.Base) => {
    console.log('[onStatusChange]: ', res);

    const raiseID = res.raiseID.toString();

    if (U.isEqual(raiseID, raiseId)) {
      refresh();
    }
  });

  const onWithdrawSuccess = useMemoizedFn((res: API.Base) => {
    console.log('[onWithdrawSuccess]: ', res);

    const raiseID = res.raiseID.toString();

    if (U.isEqual(raiseID, raiseId)) {
      Modal.alert({
        icon: 'success',
        title: '提取成功',
        content: '交易可能会有延迟，请稍后至接收钱包查看',
        confirmText: '我知道了',
      });

      refresh();
    }
  });

  useUpdateEffect(onDataChange, [data]);
  useUpdateEffect(updateScrollSpy, [planState]);
  useEmittHandler({
    [EventType.onStaking]: onStatusChange,
    [EventType.onUnstaking]: onStatusChange,
    [EventType.onRaiseFailed]: onStatusChange,
    [EventType.onCloseRaisePlan]: onStatusChange,
    [EventType.onDepositOPSFund]: onStatusChange,
    [EventType.onStartRaisePlan]: onStatusChange,
    [EventType.onChangeOpsPayer]: onStatusChange,
    [EventType.onWithdrawOPSFund]: onWithdrawSuccess,
    [EventType.onWithdrawRaiseFund]: onWithdrawSuccess,
    [EventType.onRaiserWithdraw]: onWithdrawSuccess,
    [EventType.onServicerWithdraw]: onWithdrawSuccess,
    [EventType.onInvestorWithdraw]: onWithdrawSuccess,
  });

  const renderStatus = () => {
    if (!data) return null;

    const state = (() => {
      switch (planState) {
        case RaiseState.NotStarted: // 未缴纳募集保证金
          break;
        case RaiseState.WaitPayOPSSecurityFund: // 未缴纳运维保证金
          return isPayer && <Deposit data={data} />;
        case RaiseState.WaitSeverSign: // 等待服务商签名
          return isRaiser && <Signer data={data} />;
        case RaiseState.InProgress: // 募集中
          return <Staking data={data} />;
        case RaiseState.Closed: // 已关闭
        case RaiseState.Failed: // 募集失败
          return <Failed data={data} />;
        case RaiseState.Successed: // 募集成功
          return <Success data={data} />;
      }
    })();

    const cloable = isRaiser && planState <= RaiseState.InProgress;

    return (
      <div className="d-flex flex-column gap-4">
        {state}

        {cloable && <Closer data={data} />}
      </div>
    );
  };

  return (
    <>
      <div className="container">
        <Breadcrumb items={[{ title: '全部募集计划', route: '/letsfil/raising' }, { title: data?.sponsor_company ?? '' }]} />

        <PageHeader title={`FIL募集计划 - ${F.formatNum(total, '0a')} - ${data?.sponsor_company ?? ''}`}>
          {data && (
            <div className="d-flex align-items-center gap-3">
              <ShareBtn className="btn btn-light" text={location.href} toast="链接已复制">
                <Share4 />
              </ShareBtn>

              <a className="btn btn-light text-nowrap" href={`${SCAN_URL}/${data.raise_address}`} target="_blank" rel="noreferrer">
                <Share6 />
                <span className="ms-1">查看智能合约</span>
              </a>
            </div>
          )}
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
              {planState === RaiseState.Successed && (
                <li className="nav-item">
                  <a className="nav-link" href="#statistics">
                    资产报告
                  </a>
                </li>
              )}
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

              <TimeInfo data={data} />
            </section>
            {planState === RaiseState.Successed && (
              <section id="statistics" className={styles.section}>
                <div className={styles.header}>
                  <h4 className={styles.title}>资产报告</h4>
                  <p className="mb-0">募集计划的资产报告</p>
                </div>

                <StatInfo data={data} />
              </section>
            )}
          </div>
          <div className={styles.sidebar}>{renderStatus()}</div>
        </div>
      </div>
    </>
  );
}
