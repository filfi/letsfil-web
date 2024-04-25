import { Spin, Table } from 'antd';
import { useMemo, useRef } from 'react';
import { Link, useModel } from '@umijs/max';
import type { ColumnsType } from 'antd/es/table';

import { accMul } from '@/utils/utils';
import useLoanPool from '@/hooks/useLoanPool';
import useRaiseInfo from '@/hooks/useRaiseInfo';
import LoanModal, { type ModalAttrs } from '../../components/LoanModal';
import { formatAmount, formatRate, formatSponsor } from '@/utils/format';

const fmtRate = (val: number | string) => {
  return formatRate(val, '0.0%').replace(/%$/, '');
};

const PlanLink: React.FC<{ id: number | string }> = ({ id }) => {
  const { data, isLoading } = useRaiseInfo(`${id}`);

  if (isLoading) {
    return <Spin size="small" />;
  }

  return (
    <Link to={`/overview/${id}`}>
      {formatSponsor(data?.sponsor_company)}發起的節點計劃@{data?.miner_id}
    </Link>
  );
};

const AssetsLoan: React.FC = () => {
  const modal = useRef<ModalAttrs>(null);

  const pool = useLoanPool();
  const { loanList, plan } = useModel('assets.assets');
  const { list: items, unpaid, isLoan, isLoading, refetch } = loanList;

  const list = useMemo(() => {
    const ids = items[0];
    const vals = items[1];

    return ids?.map((id, i) => ({
      id,
      amount: vals?.[i] ?? 0,
    }));
  }, [items]);

  const handleRepay = (row: API.Base) => {
    if (plan?.raising_id) {
      modal.current?.show(plan?.raising_id, row.id);
    }
  };

  const columns: ColumnsType<API.Base> = [
    {
      title: '抵押資產',
      dataIndex: 'amount',
      render: (v) => `${formatAmount(v)} FIL`,
    },
    {
      title: '借入數量',
      dataIndex: 'amount',
      render: (v) => `${formatAmount(accMul(v, 2), 4, 2)} FIL`,
    },
    {
      title: '投入節點計劃',
      dataIndex: 'id',
      render: (v) => <PlanLink id={v} />,
    },
    {
      width: 100,
      title: '操作',
      dataIndex: 'option',
      render: (_, row) => (
        <button type="button" className="btn btn-link p-o" onClick={() => handleRepay(row)}>
          還款
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3 g-xl-5">
            <div className="col">
              <div className="row row-cols-2 g-3 g-xl-5">
                <div className="col">
                  <p className="mb-1 text-gray fw-500">未償債務</p>
                  <p className="mb-0 fw-600">
                    <span className="fs-24">{formatAmount(unpaid, 4, 2)}</span>
                    <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
                  </p>
                </div>
                {/* <div>
                  <p className="mb-1 text-gray fw-500">下次週還款</p>
                  <p className="mb-0 fw-600">
                    <span className="fs-24">{formatAmount(period, 4, 2)}</span>
                    <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
                  </p>
                </div> */}
                <div className="col">
                  <p className="mb-1 text-gray fw-500">目前借款利率(APR)</p>
                  <p className="mb-0 fw-600">
                    <span className="fs-24">{fmtRate(pool.loanRate)}</span>
                    <span className="ms-1 fs-sm fw-bold text-neutral">%</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-auto">
              {isLoan ? (
                <Link className="btn btn-primary d-block" to={`/lending/select?aid=${plan?.raising_id}`}>
                  抵押借款
                </Link>
              ) : (
                <button className="btn btn-primary d-block" type="button" disabled>
                  抵押借款
                </button>
              )}
            </div>
          </div>
        </div>

        <Table rowKey="id" columns={columns} dataSource={list} loading={isLoading} pagination={false} />
      </div>

      <LoanModal ref={modal} onRefresh={refetch} />
    </>
  );
};

export default AssetsLoan;
