const ChessboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-shrink-0 w-[360px] md:w-[400px] lg:w-[480px] 2xl:w-[560px]">
      {children}
    </div>
  );
};

export default ChessboardWrapper;
