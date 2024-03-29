import { Table } from 'antd';
import { useState } from 'react';
import { Modal } from 'bootstrap';
import type { ColumnsType } from 'antd/es/table';

import { isDef } from '@/utils/utils';
import { SCAN_URL, isMainnet } from '@/constants';
import { listReward } from '@/apis/miner';
import RecordRelease from './RecordRelease';
import usePagination from '@/hooks/usePagination';
import { CREATION_TIME } from '@/constants/config';
import { formatAddr, formatEther, formatUnixDate } from '@/utils/format';

function withEmpty<D = any>(render: (value: any, row: D, index: number) => React.ReactNode) {
  return (value: any, row: D, index: number) => {
    if (isDef(value)) {
      return render(value, row, index);
    }

    return <span className="text-gray">-</span>;
  };
}

function patchUrl(cid: string) {
  return isMainnet ? `${SCAN_URL}/block/${cid}` : `${SCAN_URL}/cid/${cid}`;
}

const RecordReward: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const [row, setRow] = useState<API.Base>();

  const service = async ({ page, pageSize }: API.Base) => {
    if (data?.miner_id) {
      const params = {
        page,
        page_size: pageSize,
        miner_id: data.miner_id,
      };

      return await listReward(params);
    }

    return {
      total: 0,
      list: [],
    };
  };

  const { loading, page, pageSize, total, change, data: dataSource } = usePagination(service, { pageSize: 10, refreshDeps: [data?.miner_id] });

  const handleModal = (row: API.Base) => {
    setRow(row);

    const bs = Modal.getOrCreateInstance('#record-release');
    bs && bs.show();
  };

  const columns: ColumnsType<API.Base> = [
    {
      title: '区块Cid',
      dataIndex: 'block_cid',
      render: withEmpty((v, row) => (
        <a href={patchUrl(row.block_cid)} target="_blank" rel="noreferrer">
          <span>{formatAddr(v)}</span>
        </a>
      )),
    },
    {
      title: '区块高度',
      dataIndex: 'height',
      render: withEmpty((v) => v),
    },
    {
      title: '出块时间',
      dataIndex: 'height',
      render: withEmpty((v) => formatUnixDate(CREATION_TIME + v * 30)),
    },
    {
      title: '出块奖励',
      dataIndex: 'amount',
      render: withEmpty((v, row) => (
        <a href="javascript:;" onClick={() => handleModal(row)}>
          <span className="me-2">{formatEther(v)} FIL</span>
          <span className="bi bi-arrow-up-right"></span>
        </a>
      )),
    },
  ];

  return (
    <>
      <div className="accordion ffi-accordion mb-3">
        <div className="accordion-item">
          <h4 className="accordion-header">
            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#blocks" aria-expanded="true" aria-controls="blocks">
              <span className="bi bi-database-add"></span>
              <span className="ms-2 fs-16 fw-600">出块记录</span>
            </button>
          </h4>
          <div id="blocks" className="accordion-collapse collapse show" aria-labelledby="blocks">
            <div className="accordion-body p-0">
              <Table
                rowKey="ID"
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                pagination={{
                  total,
                  pageSize,
                  current: page,
                  onChange: change,
                  rootClassName: 'px-3 px-xl-4',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <RecordRelease id="record-release" data={row} />
    </>
  );
};

export default RecordReward;
