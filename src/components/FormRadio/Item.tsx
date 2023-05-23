import classNames from 'classnames';

import { isDef } from '@/utils/utils';
import type { RadioItemProps } from './types';

const Item: React.FC<RadioItemProps> = ({ className, checked, disabled, icon, desc, label, onChange }) => {
  return (
    <a
      className={classNames('list-group-item list-group-item-action ffi-check-item', { disabled, active: checked }, className)}
      aria-current={checked ? 'true' : undefined}
      aria-disabled={disabled ? 'true' : undefined}
      onClick={onChange}
    >
      <div className="d-flex gap-2">
        <div className="flex-shrink-0">
          <div className="ffi-check-item-icon">{icon}</div>
        </div>
        <div className="flex-grow-1">
          <h5 className="ffi-check-item-label">{label}</h5>
          {isDef(desc) && <p className="ffi-check-item-desc">{desc}</p>}
        </div>
      </div>
    </a>
  );
};

export default Item;
