import { Skeleton } from 'antd';

import FormRadio from '../FormRadio';
import { isEqual } from '@/utils/utils';

export type ProviderRadioProps = {
  value?: number | string;
  loading?: boolean;
  options?: API.Provider[];
  onChange?: (value: number | string) => void;
  onSelect?: (value: number | string, item: API.Provider) => void;
};

const ProviderSelect: React.FC<ProviderRadioProps> = ({ options, loading, value, onChange, onSelect }) => {
  const handleChange = (item: API.Provider) => {
    onChange?.(item.id);

    onSelect?.(item.id, item);
  };

  return (
    <FormRadio checkbox grid value={value}>
      <Skeleton active loading={loading}>
        {options?.map((item) => (
          <FormRadio.Item
            key={item.id}
            icon={<img src={item.logo_url} alt={item.full_name} />}
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
