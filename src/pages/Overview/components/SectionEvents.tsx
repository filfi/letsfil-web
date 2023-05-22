import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { isDef } from '@/utils/utils';
import { SCAN_URL } from '@/constants';
import { getEvents } from '@/apis/raise';
import usePagination from '@/hooks/usePagination';
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
  CloseRaisePlan: '关闭募集计划',
  StartRaisePlan: '发起人启动募集',
  ERaiseSuccess: '募集成功',
  ECreateAssetPack: '发起人签名',
  ERaiseSecurityFund: '存入发起人保证金',
  EDepositOPSSecurityFund: '存入技术运维保证金',
};

function renderName(event: string) {
  return EVENTS_MAP[event];
}

const SectionEvents: React.FC<{ data?: API.Plan }> = ({ data }) => {
  const service = async ({ page, pageSize }: any) => {
    if (data?.raising_id) {
      return await getEvents({ page, page_size: pageSize, raising_id: data.raising_id });
    }

    return { list: [], total: 0 };
  };

  const { data: list, loading } = usePagination(service, { pageSize: 100, refreshDeps: [data?.raising_id] });

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
        <a className="fw-bold" href={`${SCAN_URL}/${hash}`} target="_blank" rel="noreferrer">
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
      <Table rowKey="ID" size="middle" className="table mb-0" loading={loading} columns={columns} dataSource={list} pagination={false} />
    </>
  );
};

export default SectionEvents;
