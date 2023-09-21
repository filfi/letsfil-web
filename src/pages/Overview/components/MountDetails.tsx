import { Table } from 'antd';
import { useMemo } from 'react';
import classNames from 'classnames';
import type { TableColumnsType } from 'antd';

import { accDiv, accMul } from '@/utils/utils';
import useMountAssets from '@/hooks/useMountAssets';
import { formatAddr, formatAmount, formatPower, toNumber } from '@/utils/format';

const MountDetails: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { sponsors, servicers, investors, power } = useMountAssets(data);

  const items = useMemo(() => [...(sponsors ?? []), ...(servicers ?? []), ...(investors ?? [])], [sponsors, servicers, investors]);

  const columns: TableColumnsType<API.Equity> = [
    {
      title: '地址',
      dataIndex: 'address',
      render: formatAddr,
    },
    {
      title: '角色',
      dataIndex: 'role',
      render: (r) => <span className="badge badge-primary">{['', '主办人', '建设者', '技术服务商'][r]}</span>,
    },
    {
      title: '分配比例',
      dataIndex: 'power_proportion',
      render: (v) => <span>{toNumber(v, 5)}%</span>,
    },
    {
      title: '持有算力',
      dataIndex: 'power_proportion',
      render: (v) => {
        const rate = toNumber(v, 5);
        const _power = accMul(power, accDiv(rate, 100));

        return <span>{formatPower(_power)}</span>;
      },
    },
    {
      title: '持有质押',
      dataIndex: 'pledge_amount',
      render: (v, row) => {
        if (row.role === 1) {
          return <span className="text-gray">-</span>;
        }

        return <span>{formatAmount(toNumber(v))} FIL</span>;
      },
    },
    {
      title: '签名',
      dataIndex: 'sign_status',
      render: (s) => <span className={classNames('badge', ['badge-danger', 'badge-success'][s])}>{['待签名', '已签名'][s]}</span>,
    },
  ];

  return (
    <>
      <Table<API.Equity> rowKey="ID" columns={columns} dataSource={items} pagination={false} />
    </>
  );
};

export default MountDetails;
