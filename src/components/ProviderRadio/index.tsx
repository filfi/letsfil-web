import { Skeleton } from 'antd';

import Avatar from '../Avatar';
import FormRadio from '../FormRadio';
import { isEqual } from '@/utils/utils';
import { formatAddr } from '@/utils/format';

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

  const renderIcon = (item: API.Provider) => {
    if (item.logo_url) {
      return <img src={item.logo_url} alt={item.full_name} />;
    }

    return <Avatar address={item.wallet_address} size={{ sm: 24, lg: 32 }} />;
  };

  const renderLabel = (item: API.Provider) => {
    if (item.full_name) return item.full_name;

    return formatAddr(item.wallet_address);
  };

  return (
    <FormRadio checkbox grid value={value}>
      <Skeleton active loading={loading}>
        {options?.map((item) => (
          <FormRadio.Item
            key={item.id}
            icon={renderIcon(item)}
            desc={item.introduction}
            label={renderLabel(item)}
            checked={isEqual(value, item.id)}
            onChange={() => handleChange(item)}
          />
        ))}
      </Skeleton>
    </FormRadio>
  );
};

export default ProviderSelect;
