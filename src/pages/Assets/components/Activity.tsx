import { Table } from 'antd';
import { useParams } from '@umijs/max';
import type { ColumnsType } from 'antd/es/table';

import { SCAN_URL } from '@/constants';
import { listActivities } from '@/apis/packs';
import useAccounts from '@/hooks/useAccounts';
import usePagination from '@/hooks/usePagination';
import { formatAddr, formatEther, formatUnixDate } from '@/utils/format';

const Activity: React.FC = () => {
  const param = useParams();
  const { account } = useAccounts();

  const service = async ({ page, pageSize }: API.Base) => {
    if (account && param.id) {
      const params = {
        page,
        page_size: pageSize,
        asset_pack_id: param.id,
        wallet_address: account,
      };

      return await listActivities(params);
    }

    return {
      total: 0,
      list: [],
    };
  };

  const { data, loading } = usePagination(service, { pageSize: 100, refreshDeps: [param.id, account] });

  const columns: ColumnsType<API.Base> = [
    {
      title: '事件',
      dataIndex: 'tx_type',
      render: (type, row) => (
        <span>
          {['', '存入', '取回', '提取'][type]}
          {['', '发起人保证金', '技术运维保证金', '质押币', '收益'][row.fund_type]}
        </span>
      ),
    },
    {
      title: '数量',
      dataIndex: 'value',
      render: (v) => `${formatEther(v)} FIL`,
    },
    {
      title: '时间',
      dataIndex: 'tx_time',
      render: (v) => formatUnixDate(v),
    },
    {
      title: '消息',
      dataIndex: 'tx_hash',
      render: (v) => (
        <a href={`${SCAN_URL}/message/${v}`} target="_blank" rel="noreferrer">
          {formatAddr(v)}
        </a>
      ),
    },
  ];

  return (
    <>
      <Table rowKey="ID" columns={columns} dataSource={data} loading={loading} pagination={false} />
    </>
  );
};

export default Activity;
