import { Table } from 'antd';
import { useMemo } from 'react';
import classNames from 'classnames';
import type { TableColumnsType } from 'antd';

import { accDiv, accMul } from '@/utils/utils';
import useMinerInfo from '@/hooks/useMinerInfo';
import useMountEquity from '@/hooks/useMountEquity';
import { formatAddr, formatAmount, formatPower, toNumber } from '@/utils/format';

const MountDetails: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { data: info } = useMinerInfo(data?.miner_id);
  const { data: items, isLoading } = useMountEquity(data);

  const power = useMemo(() => +`${info?.miner_power || '0'}`, [info?.miner_power]);

  const columns: TableColumnsType<API.Base> = [
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
      render: (v) => <span>{formatAmount(toNumber(v))} FIL</span>,
    },
    {
      title: '签名',
      dataIndex: 'sign_status',
      render: (s) => <span className={classNames('badge', ['badge-danger', 'badge-success'][s])}>{['待签名', '已签名'][s]}</span>,
    },
  ];

  return (
    <>
      <Table<API.Base> rowKey="ID" columns={columns} loading={isLoading} dataSource={items} pagination={false} />
    </>
  );
};

export default MountDetails;
