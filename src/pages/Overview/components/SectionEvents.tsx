import { Table } from 'antd';
import { useMemo } from 'react';
import { useResponsive } from 'ahooks';
import type { ColumnsType } from 'antd/es/table';

import { blocks } from '../constants';
import { isDef } from '@/utils/utils';
import { SCAN_URL } from '@/constants';
import { getEvents } from '@/apis/raise';
import SpinBtn from '@/components/SpinBtn';
import useInfiniteLoad from '@/hooks/useInfiniteLoad';
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
  EMountNode: '主办人签名',
  ESponsorSign: '主办人签名',
  EInvestorSign: '建设者签名',
  ESPWithdraw: '服务商提取激励',
  ENodeDestroy: '扇区到期',
  ERaiseFailed: '计划启动失败',
  ERaiseSuccess: '质押成功',
  EStartPreSeal: '准备封装',
  ESealProgress: '正在封装',
  ERaiseWithdraw: '主办人提取激励',
  CloseRaisePlan: '关闭质押',
  StartRaisePlan: '开始质押',
  ENodeMountFailed: '节点挂载失败',
  ENodeMountSuccess: '节点挂载成功',
  SpSignWithMiner: '技术服务商签名',
  ECreatePlan: '主办人签名',
  ECreateAssetPack: '主办人签名',
  ECreatePrivatePlan: '主办人签名',
  EClosePlanToSeal: '关闭计划并进入封装',
  ESpecifyOpsPayer: '指定运维付款人',
  ESponsorWithdraw: '主办人提取激励',
  ERaiseSecurityFund: '存入主办人保证金',
  EStackFromInvestor: '建设者质押',
  EAddOpsSecurityFund: '追加运维保证金',
  EStartPreSealTransfer: '质押转入Miner地址',
  EUnstackFromInverstor: '建设者赎回',
  EDepositOPSSecurityFund: '存入运维保证金',
  EInverstorWithdrawProfit: '建设者提取激励',
  EWithdrawFundReward: '技术服务商运维保证金激励',
  EWithdrawOPSSecurityFund: '技术服务商取回保证金',
  EWithdrawRaiseSecurityFund: '主办人取回保证金',
};

function renderName(event: string) {
  return EVENTS_MAP[event];
}

function createEventsFilter(data?: API.Plan | null) {
  return function eventsFilter({ event_sign }: API.Event) {
    if (`${event_sign}`.toLowerCase().includes('push')) return false;

    if (data && blocks.some(({ id }) => id === data.raising_id)) {
      return !['EUnstackFromInverstor'].includes(event_sign);
    }

    return true;
  };
}

const SectionEvents: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const responsive = useResponsive();

  const service = async ({ page, pageSize }: any) => {
    if (data?.raising_id) {
      return await getEvents({ page, page_size: pageSize, raising_id: data.raising_id });
    }

    return { list: [], total: 0 };
  };

  const { data: list, page, noMore, loading, changePage } = useInfiniteLoad(service, { pageSize: 20, refreshDeps: [data?.raising_id] });

  const eventsFilter = useMemo(() => createEventsFilter(data), [data]);

  const dataSource = useMemo(() => list?.filter(eventsFilter), [eventsFilter, list]); //.sort(sortEvents), [list]);

  const handleMore = async () => {
    if (noMore) return;

    await changePage(page + 1);
  };

  const columns = useMemo(() => {
    const cols: ColumnsType<API.Base> = [
      {
        title: '事件',
        dataIndex: 'event_sign',
        className: 'text-gray',
        render: withEmpty(renderName),
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

    if (responsive.md) {
      cols.splice(1, 0, {
        title: '信息',
        className: 'text-gray',
        dataIndex: 'event_sign',
      });
    }

    return cols;
  }, [responsive.md]);

  return (
    <>
      <div className="mb-3">
        <Table rowKey="ID" size="middle" className="table" loading={loading} columns={columns} dataSource={dataSource} pagination={false} />
      </div>

      <p className="mb-0 text-center">
        <SpinBtn className="btn btn-light" disabled={noMore} loading={loading} onClick={handleMore}>
          {noMore ? '已加载全部' : '加载更多'}
        </SpinBtn>
      </p>
    </>
  );
};

export default SectionEvents;
