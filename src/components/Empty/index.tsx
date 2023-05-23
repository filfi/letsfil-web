import { isStr } from '@/utils/utils';
import { ReactComponent as Icon } from './imgs/emtpy.svg';

const Empty: React.FC<{
  children?: React.ReactNode;
  title?: React.ReactNode;
}> = ({ children, title = '没有募集计划' }) => {
  return (
    <div className="text-center my-5">
      <Icon />

      {isStr(title) ? <h4 className="my-4 text-gray fs-5">{title}</h4> : title}

      {children}
    </div>
  );
};

export default Empty;
