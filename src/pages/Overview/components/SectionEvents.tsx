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
  SpSignWithMiner: '服务商签名',
  ERaiseSecurityFund: '缴纳募集保证金',
  EDepositOPSSecurityFund: '缴纳运维保证金',
  EWithdrawRaiseSecurityFund: '退回募集保证金',
  EWithdrawOPSSecurityFund: '退回运维保证金',
  StartRaisePlan: '开始募集',
  CloseRaisePlan: '关闭募集',
  ERaiseFailed: '募集失败',
  ERaiseSuccess: '募集成功',
  EStackFromInvestor: '投资者质押',
  EUnstackFromInverstor: '投资者赎回',
  EInverstorWithdrawProfit: '投资者提取收益',
  ESPWithdraw: '服务商提取收益',
  ERaiseWithdraw: '募集发起人提取收益',
  EPushBlockReward: '推送区块奖励',
  EPushHistoryAssetPack: '推送历史资产包',
  ESealProgress: '封装进度',
  EStartSeal: '开始封装',
  ESealEnd: '封装结束',
  EPushSpFine: '推送服务商罚金',
  ENodeDestroy: '节点销毁',
  ESpecifyOpsPayer: '指定运维付款人',
  ECreateAssetPack: '创建资产包/募集计划',
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
      <Table rowKey="ID" size="middle" className="table mb-0" loading={loading} columns={columns} dataSource={list} pagination={false} />
    </>
  );
};

export default SectionEvents;
