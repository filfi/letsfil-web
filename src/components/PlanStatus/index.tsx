import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';

import { accDiv } from '@/utils/utils';
import { formatRate } from '@/utils/format';
import { planStatusText } from '@/constants';
import { RaiseState } from '@/constants/state';
import usePlanContract from '@/hooks/usePlanContract';
import { ReactComponent as IconInfo } from './imgs/info-circle.svg';
import { ReactComponent as IconCheck } from './imgs/check-circle.svg';
import { ReactComponent as IconMinus } from './imgs/minus-circle.svg';
import { ReactComponent as IconGlass } from './imgs/hourglass-01.svg';

const PlanStatus: React.FC<{ data?: API.Base }> = ({ data }) => {
  const [total, setTotal] = useState(0);
  const { getContract } = usePlanContract();

  const state = useMemo(() => data?.status, [data]);
  const progress = useMemo(() => {
    if (data && data.target_amount) {
      return accDiv(total, data.target_amount) * 100;
    }

    return 0;
  }, [data, total]);

  const fetchAmount = async () => {
    const contract = getContract(data?.raise_address);

    if (contract) {
      const amount = await contract.pledgeTotalAmount();

      setTotal(amount?.toString() || 0);
    }
  };

  useEffect(() => {
    fetchAmount();
  }, [data?.raise_address]);

  if (state === RaiseState.InProgress) {
    return (
      <div className="progress" role="progressbar" aria-label="Example 1px high" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-bar" style={{ width: `${progress}%` }}>
          <span style={{ fontSize: '12px', transform: 'scale(0.8)' }}>{formatRate(progress)}</span>
        </div>
      </div>
    );
  }

  const cls = ['badge-warning', 'badge-warning', 'badge-warning', '', '', 'badge-success', 'badge-danger'][state];
  const Icon = [IconGlass, IconGlass, IconGlass, null, IconMinus, IconCheck, IconInfo][state];

  return (
    <div className={classNames('badge', cls)}>
      {Icon ? <Icon /> : null}

      <span className="ms-1">{planStatusText[state]}</span>
    </div>
  );
};

export default PlanStatus;
