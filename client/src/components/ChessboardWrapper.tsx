const ChessboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={`w-96 sm:w-1/2 sm:min-w-96 max-w-[720px]`}>{children}</div>
  );
};

export default ChessboardWrapper;
