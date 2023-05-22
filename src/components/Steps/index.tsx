import classNames from 'classnames';

import styles from './styles.less';
import { isDef } from '@/utils/utils';

export type StepItem = {
  desc?: React.ReactNode;
  title?: React.ReactNode;
  status?: 'active' | 'finish';
};

export type StepItemProps = Omit<StepItem, 'desc'> & {
  children?: React.ReactNode;
};

export type StepsProps = {
  size?: 'large';
  current?: number;
  className?: string;
  direction?: 'horizontal' | 'vertical';
  items?: StepItem[];
  children?: React.ReactNode;
};

export type StepsType = React.FC<StepsProps> & {
  Item: React.FC<StepItemProps>;
};

const Item: React.FC<StepItemProps> = ({ title, children, status }) => {
  return (
    <li
      className={classNames(styles.item, {
        [styles.finish]: status === 'finish',
        [styles.active]: status === 'active',
      })}
    >
      <span className={styles.dot}></span>
      <div className={styles.content}>
        <h5 className={styles.title}>{title}</h5>

        {children}
      </div>
    </li>
  );
};

const Steps: StepsType = ({ className, children, current = 0, direction, size, items }) => {
  return (
    <ol
      className={classNames(
        styles.steps,
        {
          [styles.large]: size === 'large',
          [styles.vertical]: direction !== 'horizontal',
          [styles.horizontal]: direction === 'horizontal',
        },
        className,
      )}
    >
      {isDef(children)
        ? children
        : items?.map((item, key) => (
            <Item key={key} title={item.title} status={current > key ? 'finish' : current === key ? 'active' : undefined}>
              <p className="mb-0">{item.desc}</p>
            </Item>
          ))}
    </ol>
  );
};

Steps.Item = Item;

export default Steps;
