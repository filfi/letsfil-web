import classNames from 'classnames';

import { isStr } from '@/utils/utils';
import { ReactComponent as Icon } from '@/assets/icons/error.svg';

const Failed: React.FC<{
  className?: string;
  children?: React.ReactNode;
  title?: React.ReactNode;
  retry?: () => void;
}> = ({ className, children, title = '哦豁，出錯了！', retry }) => {
  const handleRetry = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    retry?.();
  };

  return (
    <div className={classNames('text-center my-5', className)}>
      <Icon />

      {isStr(title) ? <h4 className="my-4 text-gray fs-5">{title}</h4> : title}

      <p className="my-4 text-gray">
        <span>載入失敗</span>
        <a className="ms-3 text-underline" href="#" onClick={handleRetry}>
          重試
        </a>
      </p>

      {children}
    </div>
  );
};

export default Failed;
