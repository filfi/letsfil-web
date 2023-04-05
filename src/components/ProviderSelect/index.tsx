import { useMemo } from 'react';
import { useRequest } from 'ahooks';
import classNames from 'classnames';

import styles from './styles.less';
import { providers } from '@/apis/raise';

export type ProviderSelectProps = {
  value?: number | string;
  onChange?: (value: number | string) => void;
  onSelect?: (value: number | string, item: API.Base) => void;
};

const ProviderSelect: React.FC<ProviderSelectProps> = ({
  value,
  onChange,
  onSelect,
}) => {
  const { data } = useRequest(providers);

  const list = useMemo(
    () => data?.list.map((item, idx) => ({ ...item, id: item.id ?? idx })),
    [data],
  );

  const handleChange = (item: API.Base) => {
    onChange?.(item.id);

    onSelect?.(item.id, item);
  };

  const renderItem = (item: API.Base, idx: number) => {
    const active = `${value}` === `${item.id}`;

    return (
      <a
        key={idx}
        aria-current={active ? 'true' : undefined}
        className={classNames(
          'list-group-item list-group-item-action',
          styles.item,
          { active },
        )}
        onClick={() => handleChange(item)}
      >
        <div className="d-flex">
          <div className="flex-shrink-0">
            <img
              className={styles.icon}
              src={item.logo_url}
              alt={item.full_name}
            />
          </div>
          <div className="flex-grow-1 ms-3">
            <h5 className={styles.title}>{item.short_name}</h5>
            <p className={styles.desc}>{item.introduction}</p>
          </div>
        </div>
      </a>
    );
  };

  return (
    <div className={classNames('list-group', styles.list)}>
      {list?.map(renderItem)}
    </div>
  );
};

export default ProviderSelect;
