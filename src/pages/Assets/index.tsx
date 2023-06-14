import { Avatar, Input } from 'antd';
import { useMemo, useState } from 'react';
import { useDebounceEffect } from 'ahooks';
import { Link, NavLink, useParams } from '@umijs/max';

import styles from './styles.less';
import * as F from '@/utils/format';
import { SCAN_URL } from '@/constants';
import SpinBtn from '@/components/SpinBtn';
import Activity from './components/Activity';
import FormRadio from '@/components/FormRadio';
import PageHeader from '@/components/PageHeader';
import LoadingView from '@/components/LoadingView';
import RewardChart from './components/RewardChart';
import usePackInfo from '@/hooks/usePackInfo';
import useAssetPack from '@/hooks/useAssetPack';
import useRaiseRole from '@/hooks/useRaiseRole';
import useSProvider from '@/hooks/useSProvider';
import useLoadingify from '@/hooks/useLoadingify';
import useRaiseInfo from '@/hooks/useRaiseInfo';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import useRaiseState from '@/hooks/useRaiseState';
import useRewardOps from '@/hooks/useRewardOps';
import useRewardRaiser from '@/hooks/useRewardRaiser';
import useRewardInvestor from '@/hooks/useRewardInvestor';
import useRewardServicer from '@/hooks/useRewardServicer';
import useDepositInvestor from '@/hooks/useDepositInvestor';
import { ReactComponent as IconStar } from './imgs/icon-star.svg';
import { ReactComponent as IconTool } from './imgs/icon-tool.svg';
import { ReactComponent as IconUser } from './imgs/icon-users.svg';
import { ReactComponent as IconFil } from '@/assets/icons/filecoin.svg';

export default function Assets() {
  const param = useParams();

  const { data: pack, error: packErr, isLoading: packLoading, refetch: packRefetch } = usePackInfo(param.id);
  const { data: plan, error: planErr, isLoading: planLoading, refetch: planRefetch } = useRaiseInfo(param.id);

  const [role, setRole] = useState(-1);
  const ops = useRewardOps(plan); // 运维保证金的节点激励
  const raiser = useRewardRaiser(plan); // 主办人的节点激励
  const investor = useRewardInvestor(plan); // 建设者的节点激励
  const servicer = useRewardServicer(plan); // 服务商的节点激励

  const provider = useSProvider(plan?.service_id);
  const { isInvestor } = useDepositInvestor(plan);
  const { remainsDays } = useRaiseSeals(plan, pack);
  const { isRaiser, isServicer } = useRaiseRole(plan);
  const { isClosed, isFailed, isStarted } = useRaiseState(plan);
  const { investorPower, raiserPower, opsPower, servicerPower, investorPledge, raiserPledge, servicerPledge, opsPledge } = useAssetPack(plan, pack);

  const hasErr = useMemo(() => !!(packErr || planErr), [planErr, packErr]);
  const isLoading = useMemo(() => planLoading || packLoading, [planLoading, packLoading]);
  const roles = useMemo(() => [isInvestor, isRaiser, isServicer, isServicer], [isInvestor, isRaiser, isServicer]);

  const power = useMemo(() => [investorPower, raiserPower, servicerPower, opsPower][role] ?? 0, [role, investorPower, raiserPower, servicerPower, opsPower]);
  const pledge = useMemo(
    () => [investorPledge, raiserPledge, servicerPledge, opsPledge][role] ?? 0,
    [role, investorPledge, raiserPledge, servicerPledge, opsPledge],
  );
  const reward = useMemo(
    () => [investor.reward, raiser.reward, servicer.reward, ops.record][role] ?? 0,
    [role, investor.reward, raiser.reward, servicer.reward, ops.reward],
  );
  const record = useMemo(
    () => [investor.record, raiser.record, servicer.record, ops.record][role] ?? 0,
    [role, investor.record, raiser.record, servicer.record, ops.record],
  );
  const pending = useMemo(
    () => [investor.pending, raiser.pending, servicer.pending, ops.pending][role] ?? 0,
    [role, investor.pending, raiser.pending, servicer.pending, ops.pending],
  );

  const options = useMemo(() => {
    const items = [
      { icon: <IconUser />, label: '我是建设者', value: 0 },
      { icon: <IconStar />, label: '我是主办人', value: 1 },
      { icon: <IconTool />, label: '我是技术服务商', value: 2 },
      { icon: <IconTool />, label: '运维保证金', value: 3 },
    ];

    return items.filter((n, i) => roles[i]);
  }, [roles]);

  const refetch = async () => {
    return await Promise.all([packRefetch(), planRefetch()]);
  };

  useDebounceEffect(
    () => {
      const role = options[0]?.value ?? -1;

      setRole(role);
    },
    [options],
    { wait: 200 },
  );

  useDebounceEffect(
    () => {
      param.id && refetch();
    },
    [param.id],
    { wait: 200 },
  );

  const [withdrawing, handleWithdraw] = useLoadingify(async () => {
    if (role === 0) {
      await investor.withdrawAction();
    } else if (role === 1) {
      await raiser.withdrawAction();
    } else if (role === 2) {
      await servicer.withdrawAction();
    } else {
      // ops withdraw;
    }

    refetch();
  });

  return (
    <>
      <div className="container">
        <LoadingView data={plan} error={hasErr} loading={isLoading} retry={refetch}>
          <PageHeader
            className="mb-3 pb-0"
            title={
              plan ? (
                <span>
                  {F.formatSponsor(plan.sponsor_company)}发起的节点计划@{plan.miner_id}
                </span>
              ) : (
                '-'
              )
            }
            desc={<span className="text-uppercase">算力包 {F.formatID(param.id)}</span>}
          />

          <ul className="nav nav-tabs ffi-tabs mb-3 mb-lg-4">
            <li className="nav-item">
              <NavLink className="nav-link" to={`/assets/${param.id}`}>
                我的资产
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to={`/overview/${param.id}`}>
                节点计划
              </NavLink>
            </li>
          </ul>

          <div className="row g-3 g-lg-4">
            <div className="col-12 col-lg-4 d-flex flex-column gap-3">
              <RewardChart />

              <div className="card">
                <div className="card-body d-flex align-items-center gap-3">
                  <div className="flex-shrink-0">
                    <Avatar src={provider?.logo_url} size={40} />
                  </div>

                  <div className="flex-grow-1">
                    <p className="mb-0 fw-500">{provider?.full_name}</p>
                  </div>

                  <div className="flex-shrink-0">
                    <span className="text-gray-dark">提供技术服务</span>
                  </div>
                </div>
              </div>

              <Link className="card text-reset" to={`/overview/${param.id}`}>
                <div className="card-body d-flex align-items-center gap-3">
                  <div className="flex-shrink-0">
                    <IconStar />
                  </div>

                  <div className="flex-grow-1">
                    <p className="mb-1 fw-500">{F.formatSponsor(plan?.sponsor_company)}发起的节点计划</p>
                    <p className="mb-0 text-gray-dark">
                      {isClosed ? (
                        <span className="badge">已关闭</span>
                      ) : isFailed ? (
                        <span className="badge badge-danger">质押失败</span>
                      ) : isStarted ? (
                        <span>{F.formatUnixDate(plan?.begin_time)}启动</span>
                      ) : null}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <span className="bi bi-arrow-right fs-lg text-gray-dark"></span>
                  </div>
                </div>
              </Link>

              <div className="accordion ffi-accordion">
                <div className="accordion-item">
                  <h4 className="accordion-header">
                    <button
                      className="accordion-button"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#sector-period"
                      aria-expanded="true"
                      aria-controls="sector-period"
                    >
                      <span className="bi bi-clock text-gray-dark"></span>
                      <span className="ms-2 fs-16 fw-600">扇区期限</span>
                    </button>
                  </h4>
                  <div id="sector-period" className="accordion-collapse collapse show" aria-labelledby="Sector Period">
                    <div className="accordion-body py-2">
                      <p className="d-flex gap-3 my-3">
                        <span className="text-gray-dark">最早到期</span>
                        <span className="ms-auto fw-500">{F.formatUnixDate(pack?.min_expiration_epoch, 'll')}</span>
                      </p>
                      <p className="d-flex gap-3 my-3">
                        <span className="text-gray-dark">最晚到期</span>
                        <span className="ms-auto fw-500">{F.formatUnixDate(pack?.max_expiration_epoch, 'll')}</span>
                      </p>
                      <p className="d-flex gap-3 my-3">
                        <span className="text-gray-dark">剩余时间</span>
                        <span className="ms-auto fw-500">{pack ? <span>{remainsDays} 天</span> : '-'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="accordion ffi-accordion">
                <div className="accordion-item">
                  <h4 className="accordion-header">
                    <button
                      className="accordion-button"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#miner-info"
                      aria-expanded="true"
                      aria-controls="miner-info"
                    >
                      <span className="bi bi-info-square text-gray-dark"></span>
                      <span className="ms-2 fs-16 fw-600">详情</span>
                    </button>
                  </h4>
                  <div id="miner-info" className="accordion-collapse collapse show" aria-labelledby="Miner Info">
                    <div className="accordion-body py-2">
                      <p className="d-flex gap-3 my-3">
                        <span className="text-gray-dark">所属节点</span>
                        {pack ? (
                          <a className="ms-auto fw-500 text-underline" href={`${SCAN_URL}/address/${pack.miner_id}`} target="_blank" rel="noreferrer">
                            {pack.miner_id}
                          </a>
                        ) : (
                          <span className="ms-auto fw-500">-</span>
                        )}
                      </p>
                      <p className="d-flex gap-3 my-3">
                        <span className="text-gray-dark">扇区大小</span>
                        <span className="ms-auto fw-500">{pack ? <span className="badge badge-success">{F.formatByte(pack?.sector_size)}</span> : '-'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-8 d-flex flex-column gap-3">
              {options.length > 1 && <FormRadio className={styles.radio} type="button" items={options} value={role} onChange={setRole} />}

              <div className="card border-0 bg-warning-tertiary">
                <div className="card-body d-flex flex-column flex-md-row gap-3">
                  <div className="d-flex gap-3 me-auto">
                    <IconFil width={48} height={48} />

                    <h4 className="my-auto">
                      <span className="fs-36 fw-600">{F.formatAmount(reward)}</span>
                      <span className="ms-1 fs-18 fw-bold text-gray">FIL</span>
                    </h4>
                  </div>

                  <SpinBtn className="btn btn-primary btn-lg my-auto px-5" loading={withdrawing} disabled={reward <= 0} onClick={handleWithdraw}>
                    提取余额
                  </SpinBtn>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="row row-cols-1 row-cols-lg-2 g-3">
                    {/* <div className="col">
                      <div className="ffi-form">
                        <p className="mb-1 fw-500">线性待释放</p>
                        <Input className="bg-light text-end" readOnly size="large" suffix="FIL" value={F.formatAmount(pending)} />
                      </div>
                    </div> */}
                    <div className="col">
                      <div className="ffi-form">
                        <p className="mb-1 fw-500">锁定激励</p>
                        <Input className="bg-light text-end" readOnly size="large" suffix="FIL" value={F.formatAmount(pending, 2)} />
                      </div>
                    </div>
                    <div className="col">
                      <div className="ffi-form">
                        <p className="mb-1 fw-500">累计已提取</p>
                        <Input className="bg-light text-end" readOnly size="large" suffix="FIL" value={F.formatAmount(record, 2, 2)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <p className="mb-1 text-gray fw-500">权益算力(QAP)</p>
                  <p className="mb-0 fw-600">
                    <span className="fs-24">{F.formatPower(power)?.[0]}</span>
                    <span className="ms-1 fs-sm fw-bold text-neutral">{F.formatPower(power)?.[1]}</span>
                  </p>
                </div>
              </div>

              <div className="card">
                <div className="card-body d-flex gap-3">
                  <div>
                    <p className="mb-1 text-gray fw-500">持有质押</p>
                    <p className="mb-0 fw-600">
                      <span className="fs-24">{F.formatAmount(pledge)}</span>
                      <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
                    </p>
                  </div>

                  {/* {isDestroyed && isInvestor && (
                    <div className="ms-auto my-auto">
                      <SpinBtn className="btn btn-primary btn-lg px-5" loading={unstaking} disabled={pledge <= 0 || withdrawing} onClick={unStaking}>
                        取回
                      </SpinBtn>
                    </div>
                  )} */}
                </div>
              </div>

              <div className="accordion ffi-accordion">
                <div className="accordion-item">
                  <h4 className="accordion-header">
                    <button
                      className="accordion-button"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#activity"
                      aria-expanded="true"
                      aria-controls="activity"
                    >
                      <span className="bi bi-activity"></span>
                      <span className="ms-2 fs-16 fw-600">事件</span>
                    </button>
                  </h4>
                  <div id="activity" className="accordion-collapse collapse show" aria-labelledby="Activity">
                    <div className="accordion-body p-0">
                      <Activity />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </LoadingView>
      </div>

      <p>
        <br />
      </p>
      <p>
        <br />
      </p>
    </>
  );
}
