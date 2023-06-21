import classNames from 'classnames';

import { isStr } from '@/utils/utils';
import icon from './imgs/empty.png';

const Empty: React.FC<{
  children?: React.ReactNode;
  title?: React.ReactNode;
  titleClassName?: string;
}> = ({ children, title = '暂无数据', titleClassName }) => {
  return (
    <div className="text-center my-5">
      <img src={icon} />

      {isStr(title) ? <h4 className={classNames('my-4 fs-5', titleClassName)}>{title}</h4> : title}

      {children}
    </div>
  );
};

export default Empty;
