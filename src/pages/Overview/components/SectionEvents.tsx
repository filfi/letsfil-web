import { Table } from 'antd';
import { useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';

import { isDef } from '@/utils/utils';
import { SCAN_URL } from '@/constants';
import { getEvents } from '@/apis/raise';
import usePagination from '@/hooks/usePagination';
import useRaiseDetail from '@/hooks/useRaiseDetail';
import { formatAddr, formatUnixNow } from '@/utils/format';

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
  ESPWithdraw: '服务商提取节点激励',
  ENodeDestroy: '扇区到期',
  ERaiseFailed: '集合质押失败',
  ERaiseSuccess: '集合质押成功',
  EStartPreSeal: '准备封装',
  ESealProgress: '正在封装',
  ERaiseWithdraw: '主办人提取节点激励',
  CloseRaisePlan: '关闭集合质押',
  StartRaisePlan: '开始集合质押',
  SpSignWithMiner: '技术服务商签名',
  ECreateAssetPack: '主办人签名',
  ESpecifyOpsPayer: '指定运维付款人',
  ERaiseSecurityFund: '存入主办人保证金',
  EStackFromInvestor: '建设者认购',
  EUnstackFromInverstor: '建设者赎回',
  EDepositOPSSecurityFund: '存入技术运维保证金',
  EInverstorWithdrawProfit: '建设者提取节点激励',
  EWithdrawOPSSecurityFund: '技术服务商取回保证金',
  EWithdrawRaiseSecurityFund: '主办人取回保证金',
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

const SectionEvents: React.FC = () => {
  const { data } = useRaiseDetail();

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
