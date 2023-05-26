import classNames from 'classnames';
import { useMemo, useRef } from 'react';

import Item from './Item';
import Button from './Button';
import { isDef } from '@/utils/utils';
import type { RadioType } from './types';

const genName = () => {
  return (~~(Math.random() * 100000)).toString(16);
};

const FormRadio: RadioType = ({ className, children, checkbox, disabled, grid, items, name, type, value, onChange }) => {
  const _name = useRef(genName()).current;

  const handleChange = (value: any) => {
    onChange?.(value);
  };

  const ItemComp = useMemo(() => (type === 'button' ? Button : Item), [type]);

  const renderChildren = () => {
    if (isDef(children)) {
      return children;
    }

    const nName = name ?? _name;

    return items?.map((item, key) => (
      <ItemComp
        key={`${nName}-${key}`}
        {...item}
        name={item.name ?? nName}
        itemKey={`${nName}-${key}`}
        checked={value === item.value}
        disabled={item.disabled ?? disabled}
        onChange={() => handleChange(item.value)}
      />
    ));
  };

  if (type === 'button') {
    return (
      <div className={classNames('ffi-check ffi-check-btn', className)} role="group">
        {renderChildren()}
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'list-group ffi-check',
        {
          'ffi-check-grid': grid,
          'ffi-check-checkbox': checkbox,
        },
        className,
      )}
    >
      {renderChildren()}
    </div>
  );
};

FormRadio.Item = Item;
FormRadio.Button = Button;

export default FormRadio;
