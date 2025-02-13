import { chessboardWidth } from "@/lib/common-values";

const ChessboardWrapper = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`flex flex-col flex-shrink-0 ${chessboardWidth} ${className}`}
    >
      {children}
    </div>
  );
};

export default ChessboardWrapper;
