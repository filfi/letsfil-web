import { Table } from 'antd';
import { useState } from 'react';
import { Link } from '@umijs/max';
import type { ColumnsType } from 'antd/es/table';

import * as A from '@/apis/raise';
import * as F from '@/utils/format';
import Empty from './components/Empty';
import useAccounts from '@/hooks/useAccounts';
import PageHeader from '@/components/PageHeader';
import PlanStatus from '@/components/PlanStatus';
import usePagination from '@/hooks/usePagination';

export default function Investing() {
  const { accounts } = useAccounts();
  const [type, setType] = useState('all');
  const [sort, setSort] = useState('desc');

  const service = async ({ page, pageSize }: any) => {
    const p = {
      page,
      page_size: pageSize,
      sort: sort === 'desc' ? 'created_at desc' : 'created_at asc',
    };

    if (type === 'mine') {
      return A.raiseList({ ...p, address: accounts[0] });
    }

    return A.plans(p);
  };

  const { data, page, total, loading, pageSize, changePage } = usePagination(service, {
    refreshDeps: [type, sort],
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setType(e.target.value);
  };

  const columns: ColumnsType<API.Base> = [
    {
      title: '募集商',
      dataIndex: 'sponsor_company',
    },
    {
      title: '年华收益',
      dataIndex: 'income_rate',
      render: F.formatPercent,
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
      render: (_, row) => <PlanStatus data={row} />,
    },
    {
      title: '',
      dataIndex: 'action',
      render: (_, row) => <Link to={`/letsfil/overview/${row.raising_id}`}>查看</Link>,
    },
  ];

  return (
    <div className="container">
      <PageHeader title="Fil募集计划" desc="可查看市场上进行中的募集计划" />

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

        <button className="btn btn-light" type="button" onClick={() => setSort(sort === 'asc' ? 'desc' : 'asc')}>
          {sort === 'asc' ? <i className="bi bi-chevron-double-up"></i> : <i className="bi bi-chevron-double-down"></i>}

          <span className="ms-1">排序</span>
        </button>
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
        <Empty />
      )}
    </div>
  );
}
