import { useMemo } from 'react';
import classNames from 'classnames';

import { accDiv } from '@/utils/utils';
import { planStatusText } from '@/constants';
import { RaiseState } from '@/constants/state';
import { ReactComponent as IconInfo } from './imgs/info-circle.svg';
import { ReactComponent as IconCheck } from './imgs/check-circle.svg';
import { ReactComponent as IconMinus } from './imgs/minus-circle.svg';
import { ReactComponent as IconGlass } from './imgs/hourglass-01.svg';

const PlanStatus: React.FC<{ data?: API.Base }> = ({ data }) => {
  const state = useMemo(() => data?.status, [data]);
  const progress = useMemo(() => {
    if (data && data.target_amount) {
      return accDiv(data.actual_amount || '0', data.target_amount) * 100;
    }

    return 0;
  }, [data]);

  if (state === RaiseState.InProgress) {
    return (
      <div className="progress" role="progressbar" aria-label="Example 1px high" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-bar" style={{ width: `${progress}%` }} />
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
