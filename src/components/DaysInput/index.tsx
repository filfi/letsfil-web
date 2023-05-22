import { find } from 'lodash';
import { useMount } from 'ahooks';
import { Input, Select } from 'antd';
import { useMemo, useState } from 'react';

import { isDef } from '@/utils/utils';

export type OptionType = {
  label: string;
  value: number;
};

export type DaysInputProps = {
  value?: any;
  options?: OptionType[];
  onChange?: (value: any) => void;
};

const DaysInput: React.FC<DaysInputProps> = ({ options = [], value, onChange }) => {
  const [isCustom, setIsCustom] = useState(false);
  const selectVal = useMemo(() => (isCustom ? 'custom' : value), [isCustom, value]);
  const items = useMemo(() => [...options, { label: '自定义', value: 'custom' }], [options]);

  const handleSelect = (val: any) => {
    const isCustom = val === 'custom';

    setIsCustom(isCustom);

    if (isCustom) {
      onChange?.('');
      return;
    }

    onChange?.(val);
  };

  const handleChange = (val: any) => {
    onChange?.(val);
  };

  useMount(() => {
    if (isDef(value) && !find(items, { value })) {
      setIsCustom(true);
    }
  });

  return (
    <div className="row row-cols-1 row-cols-md-2 g-3 g-lg-4">
      <div className="col">
        <Select options={items} value={selectVal} placeholder="请选择" onSelect={handleSelect} />
      </div>
      {isCustom && (
        <div className="col">
          <Input type="number" min={0} placeholder="输入天数" suffix="天" value={value} onChange={handleChange} />
        </div>
      )}
    </div>
  );
};

export default DaysInput;
