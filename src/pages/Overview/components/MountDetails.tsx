import { Table } from 'antd';
import { useMemo } from 'react';
import { parseUnits } from 'viem';
import classNames from 'classnames';
import { useModel } from '@umijs/max';
import type { TableColumnsType } from 'antd';

import { accDiv, accMul } from '@/utils/utils';
import useMountState from '@/hooks/useMountState';
import useMountAssets from '@/hooks/useMountAssets';
import { formatAddr, formatAmount, formatPower, toNumber } from '@/utils/format';

const MountDetails: React.FC = () => {
  const { plan } = useModel('Overview.overview');

  const { isStarted } = useMountState(plan);
  const {
    sponsors = [],
    servicers = [],
    investors = [],
    superRate,
    servicerRate,
    servicerPower,
    power,
  } = useMountAssets(plan);

  const items = useMemo(() => {
    if (sponsors.length && servicers.length) {
      return [...sponsors, ...investors, ...servicers];
    }

    return [
      {
        address: plan?.raiser,
        role: 1,
        role_level: 1,
        sign_status: isStarted ? 1 : 0,
        power_proportion: parseUnits(`${superRate}`, 5),
      },
      ...investors,
      {
        address: plan?.service_provider_address,
        role: 3,
        power_proportion: '0',
        sign_status: plan?.sp_sign_status,
      },
    ] as API.Equity[];
  }, [plan, sponsors, servicers, investors, superRate, isStarted]);

  const columns: TableColumnsType<API.Equity> = [
    {
      title: '地址',
      dataIndex: 'address',
      render: (v, row) => formatAddr(row.fil_address || v),
    },
    {
      title: '角色',
      dataIndex: 'role',
      render: (r) => <span className="badge badge-primary">{['', '主辦人', '建設者', '技術服務商'][r]}</span>,
    },
    {
      title: '分配比例',
      dataIndex: 'power_proportion',
      render: (v, row) => {
        if (row.role === 3) {
          return <span>{servicerRate}%</span>;
        }

        return <span>{toNumber(v, 5)}%</span>;
      },
    },
    {
      title: '持有算力',
      dataIndex: 'power_proportion',
      render: (v, row) => {
        if (row.role === 3) {
          return <span>{formatPower(servicerPower)}</span>;
        }

        const rate = toNumber(v, 5);
        const _power = accMul(power, accDiv(rate, 100));

        return <span>{formatPower(_power)}</span>;
      },
    },
    {
      title: '持有質押',
      dataIndex: 'pledge_amount',
      render: (v, row) => {
        if (row.role === 2) {
          return <span>{formatAmount(toNumber(v))} FIL</span>;
        }

        return <span className="text-gray">-</span>;
      },
    },
    {
      title: '簽名',
      dataIndex: 'sign_status',
      render: (s) => (
        <span className={classNames('badge', ['badge-danger', 'badge-success'][s])}>{['待簽名', '已簽名'][s]}</span>
      ),
    },
  ];

  return (
    <>
      <Table<API.Equity> rowKey="ID" columns={columns} dataSource={items} pagination={false} />
    </>
  );
};

export default MountDetails;
