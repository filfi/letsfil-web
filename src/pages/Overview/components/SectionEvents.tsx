import { Table } from 'antd';
import { useMemo } from 'react';
import { useModel } from '@umijs/max';
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
  ESealEnd: '封裝結束',
  EStartSeal: '開始封裝',
  EMountNode: '主辦人簽名',
  ESponsorSign: '主辦人簽名',
  EInvestorSign: '建造者簽名',
  ESPWithdraw: '服務商提取激勵',
  ENodeDestroy: '扇區到期',
  ERaiseFailed: '計劃啟動失敗',
  ERaiseSuccess: '質押成功',
  EStartPreSeal: '準備封裝',
  ESealProgress: '正在封裝',
  ERaiseWithdraw: '主辦人提取激勵',
  CloseRaisePlan: '關閉質押',
  StartRaisePlan: '開始質押',
  ENodeMountFailed: '節點掛載失敗',
  ENodeMountSuccess: '節點掛載成功',
  SpSignWithMiner: '技術服務商簽名',
  ECreatePlan: '主辦人簽名',
  ECreateAssetPack: '主辦人簽名',
  ECreatePrivatePlan: '主辦人簽名',
  EClosePlanToSeal: '關閉計劃並進入封裝',
  ESpecifyOpsPayer: '指定運維付款人',
  ESponsorWithdraw: '主辦人提取激勵',
  ERaiseSecurityFund: '存入主辦人保證金',
  EStackFromInvestor: '建造者質押',
  EAddOpsSecurityFund: '追加運維保證金',
  EStartPreSealTransfer: '質押轉入Miner地址',
  EUnstackFromInverstor: '建造者贖回',
  EDepositOPSSecurityFund: '存入運維保證金',
  EInverstorWithdrawProfit: '建造者提取激勵',
  EWithdrawFundReward: '技術服務商運維保證金激勵',
  EWithdrawOPSSecurityFund: '技術服務商取回保證金',
  EWithdrawRaiseSecurityFund: '主辦人取回保證金',
  EDeposit: '建設池增加質押',
  EWithdraw: '建設池提取質押',
  ELoan: '抵押貸款借貸',
  ERepayInterest: '用戶償還借貸的利息',
  ERepayLoan: '用戶償還借貸的本金',
  ESetLoanParam: '推送借款年利率參數',
  ESettlePack: '批量結算',
  EAdvanceRepay: '提前還款',
  ESettleLoan: '使用者結算',
  ELoanRewardIncrease: '利息增加',
  EInterestIncrease: '利息增加',
  EUpdatePackRewardInc: '獎勵入池',
  EUpdatePackPincipalBack: '質押幣入池',
  ERepayInterestByRewards: '抵押收益歸還利息',
  EClaimRewards: '額外獎勵提取',
  ERepayInterestByReleasedTo: '建造節點質押幣歸還利息',
  ERepayLoanByReleasedTo: '建設節點質押幣歸還本金',
  EClaimReleasedTo: '額外質押提取',
  EClaimReleasedFrom: '額外質押提取',
  EClaimReleasedFromShares: '抵押額度回饋',
  ERepayInterestAdvance: '提前歸還利息',
  ERepayLoanAdvance: '提前歸還本金',
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

const SectionEvents: React.FC = () => {
  const responsive = useResponsive();
  const { plan } = useModel('Overview.overview');

  const service = async ({ page, pageSize }: any) => {
    if (plan?.raising_id) {
      return await getEvents({ page, page_size: pageSize, raising_id: plan.raising_id });
    }

    return { list: [], total: 0 };
  };

  const {
    data: list,
    page,
    noMore,
    loading,
    changePage,
  } = useInfiniteLoad(service, { pageSize: 20, refreshDeps: [plan?.raising_id] });

  const eventsFilter = useMemo(() => createEventsFilter(plan), [plan]);

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
        title: '鏈上訊息',
        dataIndex: 'tx',
        render: withEmpty((hash) => (
          <a className="fw-bold" href={`${SCAN_URL}/message/${hash}`} target="_blank" rel="noreferrer">
            {formatAddr(hash)}
          </a>
        )),
      },
      {
        title: '時間',
        className: 'fw-500',
        dataIndex: 'CreatedAt',
        render: withEmpty(formatUnixNow),
      },
    ];

    if (responsive.md) {
      cols.splice(1, 0, {
        title: '訊息',
        className: 'text-gray',
        dataIndex: 'event_sign',
      });
    }

    return cols;
  }, [responsive.md]);

  return (
    <>
      <div className="mb-3">
        <Table
          rowKey="ID"
          size="middle"
          className="table"
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
        />
      </div>

      <p className="mb-0 text-center">
        <SpinBtn className="btn btn-light" disabled={noMore} loading={loading} onClick={handleMore}>
          {noMore ? '已載入全部' : '載入更多'}
        </SpinBtn>
      </p>
    </>
  );
};

export default SectionEvents;
