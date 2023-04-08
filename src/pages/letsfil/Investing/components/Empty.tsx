import { ReactComponent as Icon } from './imgs/emtpy.svg';

const Empty: React.FC = () => {
  return (
    <div className="text-center my-5">
      <Icon />

      <h4>没有募集计划</h4>
    </div>
  );
};

export default Empty;
