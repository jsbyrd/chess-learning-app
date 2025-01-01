import ChessboardWrapper from "@/components/ChessboardWrapper";
import { DEFAULT_POSITION } from "chess.js";
import { Chessboard } from "react-chessboard";

const Home = () => {
  return (
    <div className="flex flex-wrap sm:flex-nowrap h-full justify-around items-center px-10 gap-10">
      <h1 className="text-4xl text-center flex flex-wrap justify-center">
        <span className="whitespace-nowrap">Practice All</span>
        &nbsp;
        <span className="whitespace-nowrap">Aspects</span>
        &nbsp;
        <span className="whitespace-nowrap">of Chess!</span>
      </h1>
      <ChessboardWrapper>
        <Chessboard position={DEFAULT_POSITION} arePiecesDraggable={false} />
      </ChessboardWrapper>
    </div>
  );
};

export default Home;
