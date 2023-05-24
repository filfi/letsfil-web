import { useMemo } from 'react';

import ShareBtn from '@/components/ShareBtn';
import { formatAmount, formatNum, toNumber } from '@/utils/format';
import { ReactComponent as IconHD } from '@/assets/icons/hard-drive.svg';
import { ReactComponent as IconShare } from '@/assets/icons/share-04.svg';

const PackCard: React.FC<{ data: API.Pack }> = ({ data }) => {
  const amount = useMemo(() => toNumber(data.total_pledge_amount), [data.total_pledge_amount]);
  const power = useMemo(() => formatNum(data.sector_size, '0.0 ib').split(' '), [data.sector_size]);

  return (
    <div className="card h-100">
      <div className="card-header d-flex align-items-center">
        <IconHD />

        <h4 className="card-title mb-0 mx-2">
          {data.asset_pack_id}@{data.miner_id}
        </h4>

        <ShareBtn className="btn border-0 p-0 ms-auto">
          <IconShare />
        </ShareBtn>
      </div>
      <div className="card-body py-1">
        <p className="d-flex my-3 gap-3">
          <span className="text-gray-dark">持有算力(QAP)</span>
          <span className="ms-auto">
            <span className="fs-16 fw-600">{power[0]}</span>
            <span className="text-gray-dark ms-1">{power[1]}</span>
          </span>
        </p>
        <p className="d-flex my-3 gap-3">
          <span className="text-gray-dark">持有质押币</span>
          <span className="ms-auto">
            <span className="fs-16 fw-600">{formatAmount(amount)}</span>
            <span className="text-gray-dark ms-1">FIL</span>
          </span>
        </p>
        <p className="d-flex my-3 gap-3">
          <span className="text-gray-dark">可提余额</span>
          <span className="ms-auto">
            <span className="fs-16 fw-600">{formatAmount(amount)}</span>
            <span className="text-gray-dark ms-1">FIL</span>
          </span>
        </p>
      </div>
      <div className="card-footer d-flex">
        <button type="button" className="btn btn-primary ms-auto" disabled={amount <= 0}>
          提取收益
        </button>
      </div>
    </div>
  );
};

export default PackCard;
