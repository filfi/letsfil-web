import { LoadingOutlined } from '@ant-design/icons';
import { Spin as AntSpin, type SpinProps as AntSpinProps } from 'antd';

export type SpinProps = AntSpinProps & {
  //
};

const Spin: React.FC<SpinProps> = ({ indicator, ...props }) => {
  const renderIndicator = () => {
    if (indicator) return indicator;

    return <LoadingOutlined spin />;
  };

  return <AntSpin {...props} indicator={renderIndicator()} />;
};

export default Spin;
