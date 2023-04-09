import { Table } from 'antd';
import { ethers } from 'ethers';
import { useState } from 'react';
import { useUpdateEffect } from 'ahooks';
import { Link, useModel } from '@umijs/max';
import type { ColumnsType } from 'antd/es/table';

import * as A from '@/apis/raise';
import * as F from '@/utils/format';
import Empty from './components/Empty';
import Status from './components/Status';
// import { byte2pb } from '@/utils/utils';
import PageHeader from '@/components/PageHeader';
import usePagination from '@/hooks/usePagination';

function formatIncome(progress: number) {
  const val = ethers.utils.formatUnits(progress, 6);

  return F.formatRate(val);
}

export default function Raising() {
  const [accounts] = useModel('accounts');
  const [type, setType] = useState('all');

  const service = async ({ page, pageSize }: any) => {
    const p = { page, page_size: pageSize };

    if (type === 'mine') {
      return A.raiseList({ ...p, address: accounts[0] });
    }

    return A.plans(p);
  };

  const { data, page, total, loading, pageSize, changePage } = usePagination(service);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(data);
    setType(e.target.value);
  };

  useUpdateEffect(() => {
    changePage(1);
  }, [type]);

  const columns: ColumnsType<API.Base> = [
    {
      title: '募集商',
      dataIndex: 'sponsor_company',
    },
    {
      title: '年华收益',
      dataIndex: 'income_rate',
      render: formatIncome,
    },
    {
      title: '投资者收益',
      dataIndex: 'investor_share',
      render: (val: string) => `${val}%`,
    },
    {
      title: '节点',
      dataIndex: 'miner_id',
    },
    {
      title: '节点大小',
      dataIndex: 'target_power',
      render: (val) => F.formatByte(val),
    },
    {
      title: '募集目标',
      dataIndex: 'target_amount',
      render: (val: string) => `${F.formatEther(val)} FIL`,
    },
    {
      title: '截止日期',
      dataIndex: 'end_seal_time',
      render: (val: number) => F.formatUnix(val),
    },
    {
      title: '募集进度',
      dataIndex: 'progress',
      render: (_, row) => <Status state={row.status} progress={row.progress} />,
    },
    {
      title: '',
      dataIndex: 'action',
      render: (_, row) => <Link to={`/letsfil/overview/${row.raising_id}`}>查看</Link>,
    },
  ];

  return (
    <div className="container">
      <PageHeader title="Fil募集计划" desc="可查看市场上进行中的募集计划">
        <Link className="btn btn-primary" to="/letsfil/create">
          <i className="bi bi-plus-lg"></i>
          <span className="ms-1">新建募集计划</span>
        </Link>
      </PageHeader>

      <div className="mb-4 d-flex justify-content-between">
        <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
          <input
            type="radio"
            className="btn-check"
            name="btnradio"
            id="btnradio1"
            autoComplete="off"
            value="all"
            checked={type === 'all'}
            onChange={onChange}
          />
          <label className="btn btn-outline-secondary" htmlFor="btnradio1">
            全部募集计划
          </label>

          <input
            type="radio"
            className="btn-check"
            name="btnradio"
            id="btnradio2"
            autoComplete="off"
            value="mine"
            checked={type === 'mine'}
            onChange={onChange}
          />
          <label className="btn btn-outline-secondary" htmlFor="btnradio2">
            我创建的计划
          </label>
        </div>

        <div className="dropdown">
          <button className="btn btn-light" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i className="bi bi-chevron-double-down"></i>
            <span className="ms-1">排序</span>
          </button>
          <ul className="dropdown-menu">
            <li>
              <a className="dropdown-item" href="#">
                Action
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#">
                Another action
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#">
                Something else here
              </a>
            </li>
          </ul>
        </div>
      </div>

      {data?.length ? (
        <div className="card table-card mb-4 table-responsive">
          <Table<API.Base>
            className=""
            rowKey="raising_id"
            dataSource={data}
            columns={columns}
            loading={loading}
            pagination={{
              total,
              pageSize,
              current: page,
              position: ['bottomCenter'],
              onChange: changePage,
            }}
          />
        </div>
      ) : (
        // <div className="card table-card mb-4 table-responsive">
        //   <table className="table mb-0">
        //     <thead>
        //       <tr>
        //         <th>募集商</th>
        //         <th>年化收益</th>
        //         <th>投资者权益</th>
        //         <th>节点</th>
        //         <th>节点大小</th>
        //         <th>募集目标</th>
        //         <th>截止时间</th>
        //         <th>募集进度</th>
        //         <th></th>
        //       </tr>
        //     </thead>
        //     <tbody>
        //       {data.map((item) => (
        //         <tr key={item.ID}>
        //           <td>虚构科技有限公司</td>
        //           <td><span className="fw-bold text-danger">20.4%</span></td>
        //           <td><span className="fw-bold text-danger">50%</span></td>
        //           <td>F07267363</td>
        //           <td>5PB</td>
        //           <td>10000 FIL</td>
        //           <td>2023-05-23</td>
        //           <td className="align-middle">
        //             <div className="progress"  role="progressbar" aria-label="Example 1px high" aria-valuenow={25} aria-valuemin={0} aria-valuemax={100}>
        //               <div className="progress-bar" style={{ width: '25%' }} />
        //             </div>
        //           </td>
        //           <td>
        //             <a href="#">查看</a>
        //           </td>
        //         </tr>
        //       ))}
        //     </tbody>
        //     <tfoot>
        //       <tr>
        //         <td colSpan={9} className="px-4 py-3 border-0">
        //           <div className="d-flex align-items-center justify-content-between">
        //             <button className="btn btn-light" type="button">
        //               <i className="bi bi-arrow-left"></i>
        //               <span className="ms-1">上一页</span>
        //             </button>

        //             <ul className="pagination mb-0">
        //               <li className="page-item active" aria-current="page">
        //                 <span className="page-link">1</span>
        //               </li>
        //               <li className="page-item">
        //                 <a className="page-link" href="#">2</a>
        //               </li>
        //               <li className="page-item">
        //                 <a className="page-link" href="#">3</a>
        //               </li>
        //               <li className="page-item">
        //                 <a className="page-link" href="#">4</a>
        //               </li>
        //               <li className="page-item disabled">
        //                 <span className="page-link">5</span>
        //               </li>
        //             </ul>

        //             <button className="btn btn-light" type="button">
        //               <span className="me-1">下一页</span>
        //               <i className="bi bi-arrow-right"></i>
        //             </button>
        //           </div>
        //         </td>
        //       </tr>
        //     </tfoot>
        //   </table>
        // </div>
        <Empty />
      )}
    </div>
  );
}
