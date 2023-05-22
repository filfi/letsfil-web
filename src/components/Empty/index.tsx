import { ReactComponent as Icon } from './imgs/emtpy.svg';

const Empty: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="text-center my-5">
      <Icon />

      <h4 className="my-4 text-gray fs-5">没有募集计划</h4>

      {children}
    </div>
  );
};

export default Empty;
