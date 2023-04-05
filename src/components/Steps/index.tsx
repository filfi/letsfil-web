import classNames from 'classnames';

import styles from './styles.less';

export type StepItem = {
  title: React.ReactNode;
  desc?: React.ReactNode;
};

export type StepsProps = {
  current?: number;
  items: StepItem[];
  className?: string;
};

const Steps: React.FC<StepsProps> = ({ className, current = 0, items }) => {
  return (
    <ol className={classNames(styles.steps, className)}>
      {items.map((item, key) => (
        <li
          key={key}
          className={classNames(styles.item, {
            [styles.finish]: current > key,
            [styles.active]: current === key,
          })}
        >
          <span className={styles.dot}></span>
          <div className={styles.content}>
            <h5 className={styles.title}>{item.title}</h5>
            <p className={styles.desc}>{item.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
};

export default Steps;
