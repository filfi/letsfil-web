const Loading: React.FC = () => {
  return (
    <div className="position-fixed vw-100 vh-100 start-0 top-0 d-flex flex-column align-items-center justify-content-center">
      <div className="spinner-grow text-primary m-3" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-center">Loading...</p>
    </div>
  );
};

export default Loading;
