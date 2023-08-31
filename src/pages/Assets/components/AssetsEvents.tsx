import { Table } from 'antd';
import { useParams } from '@umijs/max';
import type { ColumnsType } from 'antd/es/table';

import { isDef } from '@/utils/utils';
import { SCAN_URL } from '@/constants';
import { listActivities } from '@/apis/packs';
import useAccount from '@/hooks/useAccount';
import usePagination from '@/hooks/usePagination';
import { formatEther, formatUnixNow } from '@/utils/format';

function formatTitle(t: number, ft: number) {
  if (ft === 3) {
    return ['', '质押', '赎回', '提取激励'][t];
  }

  const a = ['', '存入', '取回', '分配'][t] ?? '';
  const c = ['', '主办人保证金', '运维保证金', '', '激励'][ft] ?? '';

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
  const param = useParams();
  const { address } = useAccount();

  const service = async ({ page, pageSize }: API.Base) => {
    if (address && param.id) {
      const params = {
        page,
        page_size: pageSize,
        asset_pack_id: param.id,
        wallet_address: address,
      };

      return await listActivities(params);
    }

    return {
      total: 0,
      list: [],
    };
  };

  const { data, loading } = usePagination(service, { pageSize: 100, refreshDeps: [param.id, address] });

  const columns: ColumnsType<API.Base> = [
    {
      title: '事件',
      dataIndex: 'tx_type',
      render: withEmpty((_, row) => <span>{formatTitle(row.tx_type, row.fund_type)}</span>),
    },
    {
      title: '数量',
      dataIndex: 'value',
      render: withEmpty((v) => `${formatEther(v)} FIL`),
    },
    {
      title: '时间/消息',
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
