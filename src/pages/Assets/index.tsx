import { useRequest } from 'ahooks';
import { Avatar, Input } from 'antd';
import { useMemo, useState } from 'react';
import { Link, NavLink, useParams } from '@umijs/max';

import styles from './styles.less';
import * as F from '@/utils/format';
import { getInfo } from '@/apis/raise';
import { SCAN_URL } from '@/constants';
import SpinBtn from '@/components/SpinBtn';
import Activity from './components/Activity';
import FormRadio from '@/components/FormRadio';
import PageHeader from '@/components/PageHeader';
import RewardChart from './components/RewardChart';
import useProvider from '@/hooks/useProvider';
import useAssetPack from '@/hooks/useAssetPack';
import useLoadingify from '@/hooks/useLoadingify';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import useRaiseState from '@/hooks/useRaiseState';
import useRewardRaiser from '@/hooks/useRewardRaiser';
import useRewardInvestor from '@/hooks/useRewardInvestor';
import useRewardServicer from '@/hooks/useRewardServicer';
import { ReactComponent as IconFil } from '@/assets/icons/filecoin.svg';
import { ReactComponent as IconStar } from './imgs/icon-star.svg';
import { ReactComponent as IconTool } from './imgs/icon-tool.svg';
import { ReactComponent as IconUser } from './imgs/icon-users.svg';

export default function Assets() {
  const param = useParams();
  const service = async () => {
    if (param.id) {
      return await getInfo(param.id);
    }
  };

  const { getProvider } = useProvider();

  const [role, setRole] = useState(0);
  const { data, refresh } = useRequest(service, { refreshDeps: [param.id] });
  const { pack, remains } = useRaiseSeals(data);
  const { isClosed, isFailed, isRaiser, isServicer } = useRaiseState(data);
  const { investPower, raiserPower, servicerPower, investPledge } = useAssetPack(
    data,
    pack ? { power: pack.pack_power, pledge: pack.pack_initial_pledge } : undefined,
  );

  const raiser = useRewardRaiser(data); // 发起人的收益
  const investor = useRewardInvestor(data); // 投资人的收益
  const servicer = useRewardServicer(data); // 服务商的收益

  const title = useMemo(() => (data ? `${data.sponsor_company}发起的募集计划@${data.miner_id}` : '-'), [data]);
  const provider = useMemo(() => getProvider?.(data?.service_id), [data?.service_id, getProvider]);

  const pledge = useMemo(() => [investPledge, 0, 0][role], [role, investPledge]);
  const power = useMemo(() => [investPower, raiserPower, servicerPower][role], [role, investPower, raiserPower, servicerPower]);
  const total = useMemo(() => [investor.total, raiser.total, servicer.total][role], [role, investor.total, raiser.total, servicer.total]);
  const reward = useMemo(() => [investor.reward, raiser.reward, servicer.reward][role], [role, investor.reward, raiser.reward, servicer.reward]);
  const pending = useMemo(() => [investor.pending, raiser.pending, servicer.pending][role], [role, investor.pending, raiser.pending, servicer.pending]);

  const options = useMemo(() => {
    const items = [{ icon: <IconUser />, label: '我是投资人', value: 0 }];

    if (isRaiser) {
      items.push({ icon: <IconStar />, label: '我是发起人', value: 1 });
    }

    if (isServicer) {
      items.push({ icon: <IconTool />, label: '我是技术服务商', value: 2 });
    }

    return items;
  }, [isRaiser, isServicer]);

  const [processing, handleWithdraw] = useLoadingify(async () => {
    if (role === 1) {
      await raiser.withdraw();
    } else if (role === 2) {
      await servicer.withdraw();
    } else {
      await investor.withdraw();
    }

    refresh();
  });

  return (
    <>
      <div className="container">
        <PageHeader className="mb-3 pb-0" title={title} desc={`算力包：${param.id}`} />

        <ul className="nav nav-tabs ffi-tabs mb-3 mb-lg-4">
          <li className="nav-item">
            <NavLink className="nav-link" to={`/assets/${param.id}`}>
              我的资产
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to={`/overview/${param.id}`}>
              募集计划
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
                  <p className="mb-1 fw-500">{data?.sponsor_company}发起的募集计划</p>
                  <p className="mb-0 text-gray-dark">
                    {isClosed ? (
                      <span className="badge">已关闭</span>
                    ) : isFailed ? (
                      <span className="badge badge-danger">募集失败</span>
                    ) : (
                      <span>{F.formatUnixDate(data?.begin_time)}启动</span>
                    )}
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
                      <span className="ms-auto fw-500">{F.formatUnixDate(pack?.sector_begin_expira, 'll')}</span>
                    </p>
                    <p className="d-flex gap-3 my-3">
                      <span className="text-gray-dark">最晚到期</span>
                      <span className="ms-auto fw-500">{F.formatUnixDate(pack?.sector_end_expira, 'll')}</span>
                    </p>
                    <p className="d-flex gap-3 my-3">
                      <span className="text-gray-dark">剩余时间</span>
                      <span className="ms-auto fw-500">{pack ? <span>{remains} 天</span> : '-'}</span>
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
            {(isRaiser || isServicer) && <FormRadio className={styles.radio} type="button" items={options} value={role} onChange={setRole} />}

            <div className="card border-0" style={{ '--bs-card-bg': '#fffaeb' } as any}>
              <div className="card-body d-flex gap-3">
                <IconFil width={48} height={48} />

                <h4 className="my-auto">
                  <span className="fs-36 fw-600">{F.formatAmount(reward)}</span>
                  <span className="ms-1 fs-18 fw-bold text-gray">FIL</span>
                </h4>

                <SpinBtn className="btn btn-primary btn-lg ms-auto my-auto px-5" loading={processing} disabled={reward <= 0} onClick={handleWithdraw}>
                  提取金额
                </SpinBtn>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="row row-cols-1 row-cols-lg-3 g-3">
                  <div className="col">
                    <div className="ffi-form">
                      <p className="mb-1 fw-500">线性待释放</p>
                      <Input className="bg-light text-end" readOnly size="large" suffix="FIL" value={F.formatAmount(pending)} />
                    </div>
                  </div>
                  <div className="col">
                    <div className="ffi-form">
                      <p className="mb-1 fw-500">锁定余额</p>
                      <Input className="bg-light text-end" readOnly size="large" suffix="FIL" value="0" />
                    </div>
                  </div>
                  <div className="col">
                    <div className="ffi-form">
                      <p className="mb-1 fw-500">累计收益</p>
                      <Input className="bg-light text-end" readOnly size="large" suffix="FIL" value={F.formatAmount(total)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <p className="mb-1 text-gray fw-500">持有算力(QAP)</p>
                <p className="mb-0 fw-600">
                  <span className="fs-24">{F.formatPower(power)?.[0]}</span>
                  <span className="ms-1 fs-sm fw-bold text-neutral">{F.formatPower(power)?.[1]}</span>
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <p className="mb-1 text-gray fw-500">持有质押币</p>
                <p className="mb-0 fw-600">
                  <span className="fs-24">{F.formatAmount(pledge)}</span>
                  <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
                </p>
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
                    <span className="ms-2 fs-16 fw-600">活动</span>
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
