import classNames from 'classnames';

import { isDef } from '@/utils/utils';
import type { RadioButtonProps } from './types';

export const Button: React.FC<RadioButtonProps> = ({ className, itemKey, checked, label, icon, name, value, onChange }) => {
  return (
    <div className={classNames(className)}>
      <input
        type="radio"
        className="btn-check"
        name={name}
        id={`radio-btn-${itemKey}`}
        autoComplete="off"
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <label className={classNames('btn btn-outline-secondary', className)} htmlFor={`radio-btn-${itemKey}`}>
        {isDef(icon) && <span className="me-2">{icon}</span>}

        <span>{label}</span>
      </label>
    </div>
  );
};

export default Button;
