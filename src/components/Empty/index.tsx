import classNames from 'classnames';

import { isStr } from '@/utils/utils';
import icon from './imgs/empty.png';

const Empty: React.FC<{
  children?: React.ReactNode;
  title?: React.ReactNode;
  titleClassName?: string;
}> = ({ children, title = '暫無數據', titleClassName }) => {
  return (
    <div className="text-center my-5">
      <img src={icon} />

      {isStr(title) ? <h4 className={classNames('my-4 fs-5', titleClassName)}>{title}</h4> : title}

      {children}
    </div>
  );
};

export default Empty;
