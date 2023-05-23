import { isDef } from '@/utils/utils';

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export type SpinBtnProps = Omit<BtnProps, 'type'> & {
  loading?: boolean;
  icon?: React.ReactNode;
  type?: BtnProps['type'];
  children?: React.ReactNode;
};

const SpinBtn: React.FC<SpinBtnProps> = ({ children, disabled, loading, icon, type = 'button', ...props }) => {
  const renderIcon = () => {
    if (loading) {
      <span className="d-inline-block me-2">
        <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
      </span>;
    }

    if (isDef(icon)) {
      <span className="d-inline-block me-2">{icon}</span>;
    }

    return null;
  };

  return (
    // eslint-disable-next-line react/button-has-type
    <button type={type} disabled={loading || disabled} {...props}>
      {renderIcon()}

      <span className="align-middle">{children}</span>
    </button>
  );
};

export default SpinBtn;
