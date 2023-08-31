import { Table } from 'antd';
import { useMemo } from 'react';
import { parseUnits } from 'viem';
import classNames from 'classnames';
import type { TableColumnsType } from 'antd';

import { accDiv, accMul } from '@/utils/utils';
import useRaiseRole from '@/hooks/useRaiseRole';
import useMountState from '@/hooks/useMountState';
import useMountAssets from '@/hooks/useMountAssets';
import { formatAddr, formatAmount, formatPower, toNumber } from '@/utils/format';

const MountDetails: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { isStarted } = useMountState(data);
  const { raiser, servicer, isSigned: isSPSigned } = useRaiseRole(data);
  const { investors, raiserRate, servicerRate, power } = useMountAssets(data);

  const items = useMemo(() => {
    return [
      {
        ID: -1,
        role: 1,
        address: raiser,
        pledge_amount: '0',
        power_proportion: parseUnits(`${raiserRate}`, 5).toString(),
        sign_status: isStarted ? 1 : 0,
      },
      {
        ID: 0,
        role: 3,
        address: servicer,
        pledge_amount: '0',
        power_proportion: parseUnits(`${servicerRate}`, 5).toString(),
        sign_status: isSPSigned ? 1 : 0,
      },
      ...(investors ?? []),
    ];
  }, [investors, raiser, servicer, raiserRate, servicerRate, isStarted, isSPSigned]);

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
      <Table<API.Base> rowKey="ID" columns={columns} dataSource={items} pagination={false} />
    </>
  );
};

export default MountDetails;
