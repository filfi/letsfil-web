import { ethers } from 'ethers';
import classNames from 'classnames';

import { RaiseState } from '@/constants/state';
import { ReactComponent as IconInfo } from './imgs/info-circle.svg';
import { ReactComponent as IconCheck } from './imgs/check-circle.svg';
import { ReactComponent as IconMinus } from './imgs/minus-circle.svg';
import { ReactComponent as IconGlass } from './imgs/hourglass-01.svg';

function formatPercent(progress: number) {
  const val = ethers.utils.formatUnits(progress, 6);

  return Math.round(+val);
}

const Status: React.FC<{ state: number; progress: number }> = ({ state, progress }) => {
  if (state === RaiseState.InProgress) {
    const val = formatPercent(progress);

    return (
      <div className="progress" role="progressbar" aria-label="Example 1px high" aria-valuenow={val} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-bar" style={{ width: `${val}%` }} />
      </div>
    );
  }

  const cls = ['badge-warning', 'badge-warning', 'badge-warning', '', '', 'badge-success', 'badge-danger'][state];
  const Icon = [IconGlass, IconGlass, IconGlass, null, IconMinus, IconCheck, IconInfo][state];
  const txt = ['未缴纳运维保证金', '未缴纳运维保证金', '等待服务商签名', '', '计划已关闭', '募集成功', '募集失败'][state];

  return (
    <div className={classNames('badge', cls)}>
      {Icon ? <Icon /> : null}

      <span className="ms-1">{txt}</span>
    </div>
  );
};

export default Status;
