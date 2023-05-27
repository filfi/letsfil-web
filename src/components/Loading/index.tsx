import classNames from 'classnames';

export type LoadingProps = {
  className?: string;
  children?: React.ReactNode;
};

const Loading: React.FC<LoadingProps> = ({ className, children }) => {
  return (
    <>
      <div className={classNames('d-flex flex-column align-items-center justify-content-center', className)}>
        <div className="spinner-grow text-primary m-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>

        {children}
      </div>
    </>
  );
};

export default Loading;
