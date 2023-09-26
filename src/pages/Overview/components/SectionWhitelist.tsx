import { useRequest } from 'ahooks';
import { Table, type TableColumnsType } from 'antd';

import { getRowKey } from '@/utils/utils';
import { getPrivateList } from '@/apis/raise';
import { formatAddr, formatAmount, toNumber } from '@/utils/format';

function withData<R>(service: (id: string) => Promise<R>, data?: API.Plan | null) {
  return async () => {
    if (data?.raising_id) {
      return await service(data.raising_id);
    }
  };
}

const SectionWhitelist: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { data: dataSource, loading } = useRequest(withData(getPrivateList, data), {
    refreshDeps: [data?.raising_id],
  });

  const columns: TableColumnsType<API.Base> = [
    {
      title: '地址',
      dataIndex: 'address',
      render: (v, row) => formatAddr(row.fil_address || v),
    },
    {
      title: '已质押',
      dataIndex: 'total_amt',
      render: (v) => <span>{formatAmount(toNumber(v))} FIL</span>,
    },
    {
      title: '质押次数',
      dataIndex: 'count',
      align: 'right',
    },
  ];

  return (
    <>
      <Table size="middle" columns={columns} loading={loading} pagination={false} dataSource={dataSource} rowKey={getRowKey} />
    </>
  );
};

export default SectionWhitelist;
