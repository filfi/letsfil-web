import { useMemo } from 'react';
import classNames from 'classnames';

import { accDiv } from '@/utils/utils';
import { planStatusText } from '@/constants';
import { RaiseState } from '@/constants/state';
import usePlanState from '@/hooks/usePlanState';
import { formatRate, toNumber } from '@/utils/format';
import useDepositInvest from '@/hooks/useDepositInvest';
import { ReactComponent as IconInfo } from './imgs/info-circle.svg';
import { ReactComponent as IconCheck } from './imgs/check-circle.svg';
import { ReactComponent as IconMinus } from './imgs/minus-circle.svg';
import { ReactComponent as IconGlass } from './imgs/hourglass-01.svg';

const PlanStatus: React.FC<{ data?: API.Plan }> = ({ data }) => {
  const { planState } = usePlanState(data?.raise_address);
  const { fetching, totalPledge: pledge } = useDepositInvest(data?.raise_address);

  const total = useMemo(() => toNumber(data?.target_amount), [data]);
  const progress = useMemo(() => (total > 0 ? accDiv(pledge, total) : 0), [total, pledge]);

  if (planState === RaiseState.InProgress) {
    return (
      <div className="progress" role="progressbar" aria-label="RaisePlanProgress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress * 100}>
        <div className="progress-bar" style={{ width: `${progress * 100}%` }}>
          <span style={{ fontSize: '12px', transform: 'scale(0.8)' }}>{formatRate(progress)}</span>
        </div>
      </div>
    );
  }

  const cls = ['badge-warning', 'badge-warning', 'badge-warning', '', '', 'badge-success', 'badge-danger'][planState];
  const Icon = [IconGlass, IconGlass, IconGlass, null, IconMinus, IconCheck, IconInfo][planState];

  if (fetching) {
    return <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>;
  }

  return (
    <div className={classNames('badge d-inline-flex align-items-center', cls)}>
      {Icon ? <Icon /> : null}

      <span className="ms-1">{planStatusText[planState]}</span>
    </div>
  );
};

export default PlanStatus;
