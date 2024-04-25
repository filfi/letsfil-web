import { Table } from 'antd';
import { useModel } from '@umijs/max';
import type { ColumnsType } from 'antd/es/table';

import { isDef } from '@/utils/utils';
import { SCAN_URL } from '@/constants';
import useAccount from '@/hooks/useAccount';
import { listActivities } from '@/apis/packs';
import usePagination from '@/hooks/usePagination';
import { formatEther, formatUnixNow } from '@/utils/format';

function formatTitle(tx: number, ft: number) {
  if (ft === 3) {
    return ['', '質押', '贖回', '提取激勵', '轉帳', '追加', '返還本金', '返還利息'][tx];
  }

  const a = ['', '存入', '取回', '分配', '轉帳', '追加', '返還本金', '返還利息'][tx] ?? '';
  const c = ['', '主辦人保證金', '運維保證金', '', '激勵', '建设池質押'][ft] ?? '';

  return `${a}${c}`;
}

function withEmpty<D = any>(render: (value: any, row: D, index: number) => React.ReactNode) {
  return (value: any, row: D, index: number) => {
    if (isDef(value)) {
      return render(value, row, index);
    }

    return <span className="text-gray">-</span>;
  };
}

const AssetsEvents: React.FC = () => {
  const { address } = useAccount();
  const { plan } = useModel('assets.assets');

  const service = async ({ page, pageSize }: API.Base) => {
    if (address && plan?.raising_id) {
      const params = {
        page,
        page_size: pageSize,
        asset_pack_id: plan.raising_id,
        wallet_address: address,
      };

      return await listActivities(params);
    }

    return {
      total: 0,
      list: [],
    };
  };

  const { data, loading } = usePagination(service, { pageSize: 100, refreshDeps: [plan?.raising_id, address] });

  const columns: ColumnsType<API.Base> = [
    {
      title: '事件',
      dataIndex: 'tx_type',
      render: withEmpty((_, row) => <span>{formatTitle(row.tx_type, row.fund_type)}</span>),
    },
    {
      title: '數量',
      dataIndex: 'value',
      render: withEmpty((v) => `${formatEther(v)} FIL`),
    },
    {
      title: '時間/訊息',
      dataIndex: 'tx_time',
      render: withEmpty((v, row) => (
        <a href={`${SCAN_URL}/message/${row.tx_hash}`} target="_blank" rel="noreferrer">
          {formatUnixNow(v * 1000)}
        </a>
      )),
    },
  ];

  return (
    <>
      <div className="accordion ffi-accordion mb-3">
        <div className="accordion-item">
          <h4 className="accordion-header">
            <button
              className="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#activity"
              aria-expanded="true"
              aria-controls="activity"
            >
              <span className="bi bi-activity"></span>
              <span className="ms-2 fs-16 fw-600">事件</span>
            </button>
          </h4>
          <div id="activity" className="accordion-collapse collapse show" aria-labelledby="Activity">
            <div className="accordion-body p-0">
              <Table rowKey="ID" columns={columns} dataSource={data} loading={loading} pagination={false} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssetsEvents;
