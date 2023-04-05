type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export type SpinBtnProps = Omit<BtnProps, 'type'> & {
  loading?: boolean;
  icon?: React.ReactNode;
  type?: BtnProps['type'];
  children?: React.ReactNode;
};

const SpinBtn: React.FC<SpinBtnProps> = ({
  children,
  disabled,
  loading,
  icon,
  type = 'button',
  ...props
}) => {
  return (
    // eslint-disable-next-line react/button-has-type
    <button type={type} disabled={loading || disabled} {...props}>
      <span className="me-2">
        {loading ? (
          <span
            className="spinner-grow spinner-grow-sm"
            role="status"
            aria-hidden="true"
          ></span>
        ) : (
          icon
        )}
      </span>

      <span className="align-middle">{children}</span>
    </button>
  );
};

export default SpinBtn;
