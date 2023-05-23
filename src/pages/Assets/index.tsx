import { useMemo } from 'react';
import { useRequest } from 'ahooks';
import { Avatar, Table } from 'antd';
import { Link, NavLink, useParams } from '@umijs/max';
import type { ColumnsType } from 'antd/es/table';

import { getInfo } from '@/apis/raise';
import { SCAN_URL } from '@/constants';
import useProvider from '@/hooks/useProvider';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import PageHeader from '@/components/PageHeader';
import RewardChart from './components/RewardChart';
import { formatByte, formatUnixDate } from '@/utils/format';
import { ReactComponent as IconStar } from './imgs/icon-star.svg';
import { ReactComponent as IconFil } from '@/assets/icons/filecoin.svg';

export default function Assets() {
  const param = useParams();
  const service = async () => {
    if (param.id) {
      return await getInfo(param.id);
    }
  };

  const { getProvider } = useProvider();

  const { data } = useRequest(service, { refreshDeps: [param.id] });
  const { pack, remains } = useRaiseSeals(data);

  const title = useMemo(() => (data ? `${data.sponsor_company}发起的募集计划@${data.miner_id}` : '-'), [data]);
  const provider = useMemo(() => getProvider?.(data?.service_id), [data?.service_id, getProvider]);

  const columns: ColumnsType<API.Base> = [
    {
      title: '事件',
      dataIndex: 'event',
    },
    {
      title: '数量',
      dataIndex: 'amount',
    },
    {
      title: '时间',
      dataIndex: 'time',
    },
    {
      title: '消息',
      dataIndex: 'hash',
    },
  ];

  return (
    <>
      <div className="container">
        <PageHeader className="mb-3 pb-0" title={title} desc="依靠强大的FVM智能合约，合作共建Filecoin存储">
          {/* <div className="d-flex align-items-center gap-3 text-nowrap">{renderActions()}</div> */}
        </PageHeader>

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
                  <span className="text-gray-dark">承担技术运维</span>
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
                  <p className="mb-0 text-gray-dark">{formatUnixDate(data?.begin_time)}启动</p>
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
                      <span className="ms-auto fw-500">{formatUnixDate(pack?.sector_begin_expira)}</span>
                    </p>
                    <p className="d-flex gap-3 my-3">
                      <span className="text-gray-dark">最晚到期</span>
                      <span className="ms-auto fw-500">{formatUnixDate(pack?.sector_end_expira)}</span>
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
                      <span className="ms-auto fw-500">{pack ? <span className="badge badge-success">{formatByte(pack?.sector_size)}</span> : '-'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-8 d-flex flex-column gap-3">
            <div className="card border-0" style={{ '--bs-card-bg': '#fffaeb' } as any}>
              <div className="card-body d-flex gap-3">
                <IconFil width={48} height={48} />

                <h4 className="my-auto">
                  <span className="fs-36 fw-600">0</span>
                  <span className="ms-1 fs-18 fw-bold text-gray">FIL</span>
                </h4>

                <button className="btn btn-primary btn-lg ms-auto my-auto px-5" type="button">
                  提取金额
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <p className="mb-1 text-gray fw-500">持有算力(QAP)</p>
                <p className="mb-0 fw-600">
                  <span className="fs-24">0</span>
                  <span className="ms-1 fs-sm fw-bold text-neutral">TiB</span>
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <p className="mb-1 text-gray fw-500">持有质押币</p>
                <p className="mb-0 fw-600">
                  <span className="fs-24">0</span>
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
                    <Table className="table" columns={columns} pagination={false} />
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
