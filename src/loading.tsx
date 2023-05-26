import Loading from './components/Loading';

const GlobalLoading: React.FC = () => {
  return (
    <Loading className="position-fixed vw-100 vh-100 start-0 top-0 align-items-center">
      <p className="text-center">Loading...</p>
    </Loading>
  );
};

export default GlobalLoading;
