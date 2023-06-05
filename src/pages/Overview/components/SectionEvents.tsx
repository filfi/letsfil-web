import { Table } from 'antd';
import { useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';

import { isDef } from '@/utils/utils';
import { SCAN_URL } from '@/constants';
import { getEvents } from '@/apis/raise';
import usePagination from '@/hooks/usePagination';
import { formatAddr, formatUnixNow } from '@/utils/format';
import type { ItemProps } from './types';

function withEmpty<D = any>(render: (value: any, row: D, index: number) => React.ReactNode) {
  return (value: any, row: D, index: number) => {
    if (isDef(value)) {
      return render(value, row, index);
    }

    return <span className="text-gray">-</span>;
  };
}

const EVENTS_MAP: Record<string, string> = {
  ESealEnd: '封装结束',
  EStartSeal: '开始封装',
  ESPWithdraw: '服务商提取收益',
  ENodeDestroy: '扇区到期',
  ERaiseFailed: '募集失败',
  ERaiseSuccess: '募集成功',
  EStartPreSeal: '准备封装',
  ESealProgress: '正在封装',
  ERaiseWithdraw: '发起人提取收益',
  CloseRaisePlan: '关闭募集',
  StartRaisePlan: '开始募集',
  SpSignWithMiner: '服务商签名',
  ECreateAssetPack: '发起人签名',
  ESpecifyOpsPayer: '指定运维付款人',
  ERaiseSecurityFund: '存入发起人保证金',
  EStackFromInvestor: '投资者认购',
  EUnstackFromInverstor: '投资者赎回',
  EDepositOPSSecurityFund: '存入技术运维保证金',
  EInverstorWithdrawProfit: '投资者提取收益',
  EWithdrawOPSSecurityFund: '提取运维保证金',
  EWithdrawRaiseSecurityFund: '提取发起人保证金',
};

function renderName(event: string) {
  return EVENTS_MAP[event];
}

function sortEvents(a: API.Event, b: API.Event) {
  if (a.event_sign === 'EStartSeal' && b.event_sign === 'ERaiseSuccess') {
    return -1;
  }

  return 0;
}

const SectionEvents: React.FC<ItemProps> = ({ data }) => {
  const service = async ({ page, pageSize }: any) => {
    if (data?.raising_id) {
      return await getEvents({ page, page_size: pageSize, raising_id: data.raising_id });
    }

    return { list: [], total: 0 };
  };

  const { data: list, loading } = usePagination(service, { pageSize: 100, refreshDeps: [data?.raising_id] });
  const dataSource = useMemo(() => list?.filter((i) => !`${i.event_sign}`.toLowerCase().includes('push')).sort(sortEvents), [list]);

  const columns: ColumnsType<API.Base> = [
    {
      title: '活动',
      dataIndex: 'event_sign',
      className: 'text-gray',
      render: withEmpty(renderName),
    },
    {
      title: '信息',
      className: 'text-gray',
      dataIndex: 'event_sign',
    },
    {
      title: '链上消息',
      dataIndex: 'tx',
      render: withEmpty((hash) => (
        <a className="fw-bold" href={`${SCAN_URL}/message/${hash}`} target="_blank" rel="noreferrer">
          {formatAddr(hash)}
        </a>
      )),
    },
    {
      title: '时间',
      className: 'fw-500',
      dataIndex: 'CreatedAt',
      render: withEmpty(formatUnixNow),
    },
  ];

  return (
    <>
      <Table
        rowKey="ID"
        size="middle"
        className="table mb-0"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ x: 560 }}
      />
    </>
  );
};

export default SectionEvents;
