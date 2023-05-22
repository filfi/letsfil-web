import { Link } from '@umijs/max';
import classNames from 'classnames';

import styles from './styles.less';
import { ReactComponent as IconHome } from '@/assets/icons/home-line.svg';

export type BreadcrumbItem = {
  href?: string;
  route?: string;
  title?: React.ReactNode;
};

export type BreadcrumbProps = {
  className?: string;
  items: BreadcrumbItem[];
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ className, items }) => {
  const renderItem = (item: BreadcrumbItem, idx: number) => {
    const isActive = idx === items.length - 1;

    return (
      <li key={idx} className={classNames('breadcrumb-item', styles.item, { active: isActive })} aria-current={isActive ? 'page' : undefined}>
        {item.route ? <Link to={item.route}>{item.title}</Link> : item.href ? <a href={item.href}>{item.title}</a> : item.title}
      </li>
    );
  };

  return (
    <nav className={className} aria-label="breadcrumb">
      <ol className={classNames('breadcrumb', styles.breadcrumb)}>
        <li className={classNames('breadcrumb-item', styles.item)}>
          <Link to="/">
            <IconHome className="d-block" width={20} height={20} />
          </Link>
        </li>
        {items.map(renderItem)}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
