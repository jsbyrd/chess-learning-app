const ChessboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center w-[360px] h-[360px] md:w-[400px] md:h-[400px] lg:w-[480px] lg:h-[480px] 2xl:w-[560px] 2xl:h-[560px]">
      {children}
    </div>
  );
};

export default ChessboardWrapper;
