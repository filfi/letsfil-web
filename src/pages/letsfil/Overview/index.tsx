import dayjs from 'dayjs';
import { ethers } from 'ethers';
import { ScrollSpy } from 'bootstrap';
import { useModel, useParams } from '@umijs/max';
import { useMemo, useRef, useState } from 'react';
import { useMount, useRequest, useUpdateEffect } from 'ahooks';

import styles from './styles.less';
import * as F from '@/utils/format';
import * as U from '@/utils/utils';
import Steps from '@/components/Steps';
import { getInfo } from '@/apis/raise';
import toastify from '@/utils/toastify';
import { EventType } from '@/utils/mitt';
import Closer from './components/Closer';
import Closed from './components/Closed';
import Failed from './components/Failed';
import Staking from './components/Staking';
import Success from './components/Success';
import Withdraw from './components/Withdraw';
import Unstaking from './components/Unstaking';
import useProvider from '@/hooks/useProvider';
import { RaiseState } from '@/constants/state';
import Breadcrumb from '@/components/Breadcrumb';
import PageHeader from '@/components/PageHeader';
import useLoadingify from '@/hooks/useLoadingify';
import useAuthHandler from '@/hooks/useAuthHandler';
import useEmittHandler from '@/hooks/useEmitHandler';
import usePlanContract from '@/hooks/usePlanContract';
import { ReactComponent as Share4 } from '@/assets/icons/share-04.svg';
import { ReactComponent as Share6 } from '@/assets/icons/share-06.svg';
import { ReactComponent as NodeIcon } from '@/assets/icons/node-black.svg';

async function initScrollSpy() {
  return new ScrollSpy(document.querySelector('[data-bs-spy="scroll"]'));
}

export default function Overview() {
  const params = useParams();
  const address = useRef<string>();
  const withdraw = useRef<ModalAttrs>(null);
  const unstaking = useRef<ModalAttrs>(null);

  const [accounts] = useModel('accounts');
  const plan = usePlanContract(address);
  const [amount, setAmount] = useState(0);
  const [planState, setPlanState] = useState(-1);
  const [nodeState, setNodeState] = useState(-1);
  const [totalAmount, setTotalAmount] = useState(0);

  const { getProvider } = useProvider();

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

  const getAmounts = async () => {
    const totalAmount = await plan.pledgeTotalAmount();
    setTotalAmount(+ethers.utils.formatEther(totalAmount));

    if (accounts[0]) {
      const amount = await plan.pledgeAmount(accounts[0]);
      setAmount(+ethers.utils.formatEther(amount));
    }
  };

  const { data } = useRequest(service, { refreshDeps: [params] });

  const onDataChange = () => {
    address.current = data?.raise_address;

    getRaiseState();
    getNodeState();
    getAmounts();
  };

  const raiseId = useMemo(() => data?.raising_id, [data]);
  const total = useMemo(() => +ethers.utils.formatEther(`${data?.target_amount ?? 0}`), [data]);
  const isOwner = useMemo(() => U.isEqual(data?.raiser, accounts[0]), [data, accounts]);
  const isProvider = useMemo(() => U.isEqual(data?.service_provider_address, accounts[0]), [data, accounts]);
  const percent = useMemo(() => (total > 0 ? totalAmount / total : 0), [total, totalAmount]);
  const provider = useMemo(() => (data?.service_id ? getProvider(data.service_id) : undefined), [data]);

  const onCloseRaisePlan = (res: API.Base) => {
    console.log('[onCloseRaisePlan]: ', res);

    const raiseID = res.raiseID.toNumber();

    if (U.isEqual(raiseID, raiseId)) {
      setPlanState(RaiseState.Closed);
    }
  };

  useMount(initScrollSpy);
  useUpdateEffect(onDataChange, [data]);
  useEmittHandler({
    [EventType.OnCloseRaisePlan]: onCloseRaisePlan,
  });

  const { loading: closing, run: handleClose } = useLoadingify(
    useAuthHandler(async () => {
      await toastify(async () => {
        return U.withTx(plan.closeRaisePlan());
      })();
    }),
  );

  const { loading: rasieLoading, run: handleRaiseFund } = useLoadingify(
    useAuthHandler(async (address: string) => {
      await toastify(async () => {
        return U.withTx(plan.withdrawRaiseFund(address));
      })();
    }),
  );

  const { loading: unstakeLoading, run: handleUnstaking } = useLoadingify(
    useAuthHandler(async ({ amount }: { amount: string; address: string }) => {
      await toastify(async () => {
        return U.withTx(plan.unStaking(ethers.utils.parseEther(`${amount}`)));
      })();
    }),
  );

  const showWithdraw = () => {
    withdraw.current?.show();
  };

  const showUnstaking = () => {
    unstaking.current?.show();
  };

  const renderStatus = () => {
    if (!data) return null;

    const state = (() => {
      switch (planState) {
        case RaiseState.NotStarted: // 未开始
        case RaiseState.WaitPayOPSSecurityFund: // 待缴纳运维保证金
        case RaiseState.WaitSeverSign: // 等待服务商签名
          break;
        case RaiseState.InProgress: // 募集中
          return <Staking amount={amount} loading={unstakeLoading} raiseID={raiseId} total={total} onConfirm={showUnstaking} />;
        case RaiseState.Closed: // 已关闭
          return <Closed amount={data?.security_fund} loading={rasieLoading} onConfirm={showWithdraw} />;
        case RaiseState.Successed: // 募集已完成
          return <Success data={data} state={nodeState} loading={rasieLoading} onConfirm={showWithdraw} />;
        case RaiseState.Failed: // 募集失败
          return <Failed amount={data?.security_fund} loading={rasieLoading} onConfirm={showWithdraw} />;
      }
    })();

    const cloable = isOwner && planState <= RaiseState.InProgress;

    return (
      <>
        {state}

        {cloable && <Closer loading={closing} onConfirm={handleClose} />}
      </>
    );
  };

  return (
    <>
      <div className="container">
        <Breadcrumb items={[{ title: '全部募集计划', route: '/letsfil/raising' }, { title: data?.sponsor_company ?? '' }]} />

        <PageHeader title={`FIL募集计划 - ${F.formatNum(total, '0a')} - ${data?.sponsor_company ?? ''}`}>
          <div className="d-flex align-items-center gap-3">
            <button type="button" className="btn btn-light">
              <Share4 />
            </button>
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

              <div className="row row-cols-1 row-cols-md-2 g-3 mb-3 mb-lg-4">
                <div className="col">
                  <div className="card h-100">
                    <div className="card-body">
                      <p className="mb-1 text-gray-dark">计划募集</p>
                      <p className="mb-0 d-flex align-items-center justify-content-between">
                        <span className="fs-5 fw-bold">
                          <span className="fs-3">{F.formatNum(total, '0a')}</span>
                          <span className="ms-1 text-neutral">FIL</span>
                        </span>
                        <span className="badge badge-success">已募{F.formatRate(percent)}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col">
                  <div className="card h-100">
                    <div className="card-body">
                      <p className="mb-1 text-gray-dark">年化收益（预估）</p>
                      <p className="mb-0 d-flex align-items-center justify-content-between">
                        <span className="fs-5 fw-bold">
                          <span className="fs-3">25.7</span>
                          <span className="ms-1 text-neutral">%</span>
                        </span>
                        <span className="badge badge-primary">
                          {isOwner ? data?.raiser_share : isProvider ? data?.servicer_share : data?.investor_share}% · 总产出
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <table className="table">
                <tbody>
                  <tr>
                    <th>发起人</th>
                    <td>
                      <p className="mb-0">{data?.sponsor_company}</p>
                      <p className="mb-0 text-gray-dark">{F.formatAddr(data?.raiser)}</p>
                    </td>
                    <th>服务商</th>
                    <td>
                      <p className="mb-0">{provider?.full_name}</p>
                      <p className="mb-0 text-gray-dark">{F.formatAddr(provider?.wallet_address)}</p>
                    </td>
                  </tr>
                  <tr>
                    <th>募集目标</th>
                    <td>{F.formatNum(total, '0a')} FIL</td>
                    <th>保证金</th>
                    <td>5%</td>
                  </tr>
                  <tr>
                    <th>截止日期</th>
                    <td>{F.formatDate(data?.end_seal_time * 1000, 'lll')}</td>
                    <th>距截止还有</th>
                    <td>{U.diffDays(data?.end_seal_time)}天</td>
                  </tr>
                  <tr>
                    <th>预期封装完成</th>
                    <td>{F.formatDate(dayjs(data?.raise_create_time * 1000).add(data?.seal_time_limit, 's'), 'lll')}</td>
                    <th>封装时间</th>
                    <td>{U.sec2day(data?.seal_time_limit)}天</td>
                  </tr>
                  <tr>
                    <th>扇区到期(估)</th>
                    <td>{F.formatDate(dayjs(data?.raise_create_time * 1000).add(data?.sector_period, 's'), 'lll')}</td>
                    <th>扇区期限</th>
                    <td>{U.sec2day(data?.sector_period)}天</td>
                  </tr>
                </tbody>
              </table>
            </section>
            <section id="allocation-plan" className={styles.section}>
              <div className={styles.header}>
                <h4 className={styles.title}>分配方案</h4>
                <p className="mb-0">募集计划的分配方案</p>
              </div>

              <table className="table">
                <tbody>
                  <tr>
                    <th>FIL奖励</th>
                    <td>按照初始投入比例分配</td>
                    <th>分配方式</th>
                    <td>用户自提</td>
                  </tr>
                  <tr>
                    <th>质押币</th>
                    <td>按照初始投入返还</td>
                    <th>返还时间</th>
                    <td>扇区到期返还</td>
                  </tr>
                  <tr>
                    <th>Gas费</th>
                    <td>按照初始投入比例承担</td>
                    <th>扇区期限</th>
                    <td>{U.sec2day(data?.sector_period)}天</td>
                  </tr>
                </tbody>
              </table>
            </section>
            <section id="build-plan" className={styles.section}>
              <div className={styles.header}>
                <h4 className={styles.title}>建设方案</h4>
                <p className="mb-0">募集计划的建设方案</p>
              </div>

              <table className="table">
                <tbody>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <NodeIcon fill="#1D2939" />
                        <span className="ms-2">{data?.miner_id}</span>
                      </div>
                    </td>
                    <td>规划容量 {U.byte2pb(data?.target_power)}PB</td>
                    <td className="text-end">
                      <a href="#">链上查看</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
            <section id="timeline" className={styles.section}>
              <div className={styles.header}>
                <h4 className={styles.title}>时间进度</h4>
                <p className="mb-0">募集计划的时间进度</p>
              </div>

              <Steps
                current={0}
                items={[
                  {
                    title: '发布募集计划',
                    desc: F.formatDate(data?.raise_create_time * 1000),
                  },
                  {
                    title: '募集截止',
                    desc: `${F.formatDate(data?.end_seal_time * 1000, 'lll')} 募集总额 ${F.formatEther(data?.target_amount)} FIL`,
                  },
                  {
                    title: '节点封装中',
                    desc: `预计需要${U.sec2day(data?.seal_time_limit)}天，已完成0%`,
                  },
                  { title: '节点生产阶段', desc: '产出和分配收益' },
                  {
                    title: '解除质押',
                    desc: `预计为${F.formatDate(dayjs(data?.raise_create_time * 1000).add(data?.sector_period, 's'), 'lll')}，扇区有效期 ${U.sec2day(
                      data?.sector_period,
                    )}天`,
                  },
                ]}
              />
            </section>
          </div>
          <div className={styles.sidebar}>{renderStatus()}</div>
        </div>
      </div>

      <Withdraw ref={withdraw} onConfirm={handleRaiseFund} />
      <Unstaking ref={unstaking} amount={amount} onConfirm={handleUnstaking} />
    </>
  );
}
