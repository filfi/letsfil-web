import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';

import styles from '../styles.less';
import { isDef } from '@/utils/utils';
import Modal from '@/components/Modal';
import { listRelease } from '@/apis/miner';
import { formatEther, formatUnixDate } from '@/utils/format';
import useInfiniteLoad from '@/hooks/useInfiniteLoad';
import type { ModalProps } from '@/components/Modal';
import { CREATION_TIME } from '@/constants/config';

function withEmpty<D = any>(render: (value: any, row: D, index: number) => React.ReactNode) {
  return (value: any, row: D, index: number) => {
    if (isDef(value)) {
      return render(value, row, index);
    }

    return <span className="text-gray">-</span>;
  };
}

const RecordRelease: React.FC<ModalProps & { data?: API.Base }> = ({ data, ...props }) => {
  const service = async ({ page, pageSize }: API.Base) => {
    console.log('[release service]: ', data);

    if (data?.dedup_id) {
      const params = {
        page,
        page_size: pageSize,
        dedup_id: data.dedup_id,
        miner_id: data.miner_addr,
      };

      return await listRelease(params);
    }

    return {
      total: 0,
      list: [],
    };
  };

  const { data: dataSource, loading } = useInfiniteLoad(service, { manual: true, refreshDeps: [data] });

  const columns: ColumnsType<API.Base> = [
    {
      title: '释放类型',
      dataIndex: 'id',
      render: withEmpty((v) => (`${v}` === '0' ? '立即释放' : '线性释放')),
    },
    {
      title: '释放数值',
      dataIndex: 'release_reward',
      render: withEmpty((v) => `${formatEther(v)} FIL`),
    },
    {
      title: '释放高度',
      dataIndex: 'height',
      render: withEmpty((v) => v),
    },
    {
      title: '释放时间',
      dataIndex: 'height',
      render: withEmpty((v) => formatUnixDate(CREATION_TIME + v * 30)),
    },
  ];

  return (
    <>
      <Modal.Alert
        title={
          <>
            <p className="mb-1 fs-20 fw-bold text-main">释放明细</p>
            <p className="mb-0 text-sm text-gray">激励总额：{formatEther(data?.amount)} FIL</p>
          </>
        }
        confirmText="好的"
        bodyClassName="p-0"
        headerClassName="border-0"
        footerClassName="border-0 justify-content-end"
        renderFooter={() => (
          <button className="btn btn-primary" type="button" data-bs-toggle="modal" data-dismiss="modal">
            好的
          </button>
        )}
        {...props}
      >
        <div className={styles.wrapper}>
          <Table rowKey="height" columns={columns} dataSource={dataSource} loading={loading} pagination={false} />
        </div>
      </Modal.Alert>
    </>
  );
};

export default RecordRelease;
