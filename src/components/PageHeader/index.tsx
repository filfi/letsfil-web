import classNames from 'classnames';

import styles from './styles.less';

export type PageHeaderProps = {
  className?: string;
  title?: React.ReactNode;
  desc?: React.ReactNode;
  children?: React.ReactNode;
};

const PageHeader: React.FC<PageHeaderProps> = ({ className, title, desc, children }) => {
  return (
    <div className={classNames('d-flex flex-column flex-lg-row gap-3', styles.caption, className)}>
      <div className={classNames('flex-fill', styles.content)}>
        <h4 className={styles.title}>{title}</h4>
        <p className={styles.desc}>{desc}</p>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default PageHeader;
