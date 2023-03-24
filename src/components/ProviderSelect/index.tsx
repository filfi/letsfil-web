import { useRequest } from 'ahooks';
import classNames from 'classnames';

import styles from './styles.less';
import { providers } from '@/apis/raise';

export type ProviderSelectProps = {
  value?: number | string;
  onChange?: (value: number | string) => void;
};

const ProviderSelect: React.FC<ProviderSelectProps> = ({ value, onChange }) => {
  const { data } = useRequest(providers);

  const handleChange = (item: API.Base) => {
    onChange?.(item.ID);
  };

  return (
    <div className={classNames('list-group', styles.list)}>
      {data?.map((item) => (
        <a
          key={item.ID}
          className={classNames('list-group-item list-group-item-action', styles.item, { active: `${value}` === `${item.ID}` })}
          aria-current={`${value}` === `${item.ID}` ? 'true' : undefined}
          onClick={() => handleChange(item)}
        >
          <div className="d-flex">
            <div className="flex-shrink-0">
              <img className={styles.icon} src={item.logo_url} alt={item.full_name} />
            </div>
            <div className="flex-grow-1 ms-3">
              <h5 className={styles.title}>{item.short_name}</h5>
              <p className={styles.desc}>{item.introduction}</p>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};

export default ProviderSelect;
