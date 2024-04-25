import { useMemo } from 'react';

import { accDiv, accMul } from '@/utils/utils';
import { formatAmount, formatID, formatPower } from '@/utils/format';
import { ReactComponent as IconLock } from '@/assets/icons/lock-02.svg';

export type ItemProps = {
  rate?: number;
  power?: number;
  amount?: number;
  list?: API.Pack['PledgeList'];
};

const LoanCard: React.FC<ItemProps> = ({ amount = 0, list, power = 0, rate = 0 }) => {
  const interestPower = useMemo(() => accMul(power, accDiv(rate, 100)), [power, rate]);

  return (
    <div className="card-body py-1 bg-body-tertiary border-top">
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">
          <span className="align-middle">槓桿質押</span>
          <IconLock />
        </span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatAmount(amount)}</span>
          <span className="text-gray-dark ms-1">FIL</span>
        </span>
      </p>

      <div className="d-flex my-3 gap-3">
        <span className="text-gray-dark">抵押品</span>
        <p className="d-flex flex-column gap-3 mb-0 ms-auto">
          {list?.map((item) => (
            <span key={item.pledge_id} className="fs-16 fw-600">
              {formatID(item.pledge_id)}@{item.miner_id}
            </span>
          ))}
        </p>
      </div>

      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">封裝算力</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatPower(power)?.[0]}</span>
          <span className="text-gray-dark ms-1">{formatPower(power)?.[1]}</span>
        </span>
      </p>

      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">我的算力(封裝算力 * {rate}%)</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatPower(interestPower)?.[0]}</span>
          <span className="text-gray-dark ms-1">{formatPower(interestPower)?.[1]}</span>
        </span>
      </p>
    </div>
  );
};

export default LoanCard;
