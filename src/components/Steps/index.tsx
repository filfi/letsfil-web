import classNames from 'classnames';

import styles from './styles.less';

export type StepsProps = {
  current?: number;
};

const Steps: React.FC<StepsProps> = ({ current = 0 }) => {
  const items = [
    { title: '计划方案' },
    { title: '分配方案' },
    { title: '建设方案' },
    { title: '确认信息' },
    { title: '支付保证金' },
  ];

  return (
    <ol className={styles.steps}>
      {items.map((item, key) => (
        <li
          key={key}
          className={classNames(styles.item, {
            [styles.finish]: current > key,
            [styles.active]: current === key,
          })}
        >
          <span className={styles.dot}></span>
          <span className={styles.title}>{item.title}</span>
        </li>
      ))}
    </ol>
  );
};

export default Steps;
