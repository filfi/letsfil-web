import { useMemo } from 'react';
import { Skeleton } from 'antd';

import FormRadio from '../FormRadio';
import { isEqual } from '@/utils/utils';
import useProvider from '@/hooks/useProvider';

export type ProviderRadioProps = {
  value?: number | string;
  onChange?: (value: number | string) => void;
  onSelect?: (value: number | string, item: API.Provider) => void;
};

const ProviderSelect: React.FC<ProviderRadioProps> = ({ value, onChange, onSelect }) => {
  const { list, loading } = useProvider();

  const items = useMemo(() => list?.map((item) => item), [list]);

  const handleChange = (item: API.Provider) => {
    onChange?.(item.id);

    onSelect?.(item.id, item);
  };

  return (
    <FormRadio checkbox grid value={value}>
      <Skeleton active loading={loading}>
        {items?.map((item) => (
          <FormRadio.Item
            key={item.id}
            icon={<img src={item.logo_url} alt={item.short_name} />}
            label={item.full_name}
            desc={item.introduction}
            checked={isEqual(value, item.id)}
            onChange={() => handleChange(item)}
          />
        ))}
      </Skeleton>
    </FormRadio>
  );
};

export default ProviderSelect;
