import classNames from 'classnames';

import styles from './styles.less';

export type PageHeaderProps = {
  title?: React.ReactNode;
  desc?: React.ReactNode;
  children?: React.ReactNode;
};

const PageHeader: React.FC<PageHeaderProps> = ({ title, desc, children }) => {
  return (
    <div
      className={classNames(
        'd-flex flex-column flex-md-row gap-3',
        styles.caption,
      )}
    >
      <div className={classNames('flex-fill', styles.content)}>
        <h4 className={styles.title}>{title}</h4>
        <p className={styles.desc}>{desc}</p>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default PageHeader;
