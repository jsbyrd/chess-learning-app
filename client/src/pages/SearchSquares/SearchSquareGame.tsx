import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFen } from "@/components/FenProvider";
import { Chess, DEFAULT_POSITION, Piece, Square } from "chess.js";
import {
  Arrow,
  BoardOrientation,
} from "react-chessboard/dist/chessboard/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TouchBackend } from "react-dnd-touch-backend";
import { isMobile } from "@/lib/is-mobile";
import { ChessColor } from "@/lib/common-types";
import ChessboardWrapper from "@/components/ChessboardWrapper";
import { chessboardWidth } from "@/lib/common-values";
import getRandomSquare from "@/lib/get-random-square";
// import { createMmAnalytics } from "@/services/mmAnalyticsService";
// import { useUser } from "@/components/UserProvider";

const MAX_TIME = 6000;

export interface SearchSquareGameProps {
  setIsPlaying: (isPlaying: boolean) => void;
  selectedColor: ChessColor;
  isPractice: boolean;
  showCoordinates: boolean;
}

const SearchSquareGame = (props: SearchSquareGameProps) => {
  const { setIsPlaying, selectedColor, isPractice, showCoordinates } = props;
  const [time, setTime] = useState(MAX_TIME);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [move, setMove] = useState("");
  const [orientation, setOrientation] = useState<BoardOrientation>("white");
  const [showPopup, setShowPopup] = useState(false);
  const [isActiveGame, setIsActiveGame] = useState(true);
  const [customArrows, setCustomArrows] = useState<Arrow[] | undefined>(
    undefined
  );
  const [currentSquare, setCurrentSquare] = useState<string | undefined>(
    getRandomSquare(undefined)
  );
  const [nextSquare, setNextSquare] = useState<string | undefined>(undefined);

  const generateNextSquare = () => {
    const newSquare = getRandomSquare(currentSquare);
    setNextSquare(newSquare);
  };

  useEffect(() => {
    generateNextSquare();
  }, [currentSquare]);

  useEffect(() => {
    if (!isActiveGame || isPractice) return;

    const handleInterval = () => {
      setTime((prevTime) => {
        // When time gets to 0, switch off game and save game data
        if (prevTime <= 0.1) {
          clearInterval(interval);
          setShowPopup(true);
          setIsActiveGame(false);
          return 0;
        }
        return prevTime - 0.1;
      });
    };

    const interval = setInterval(handleInterval, 100);

    return () => clearInterval(interval);
  }, [isActiveGame, isPractice, score, total]);

  const handleSquareClick = (square: Square) => {
    const clickedSquare = document.querySelector(
      `[data-square="${square}"]`
    ) as HTMLElement;
    const originalColor = clickedSquare.style.backgroundColor;

    if (square === currentSquare) {
      clickedSquare.style.transition = "background-color 0.1s";
      clickedSquare.style.backgroundColor = "green";
      setTimeout(() => {
        clickedSquare.style.backgroundColor = originalColor;
        clickedSquare.style.transition = "";
      }, 100);
      setCurrentSquare(nextSquare);
    } else {
      clickedSquare.style.transition = "background-color 0.1s";
      clickedSquare.style.backgroundColor = "red";
      setTimeout(() => {
        clickedSquare.style.backgroundColor = originalColor;
        clickedSquare.style.transition = "";
      }, 100);
    }
  };

  const handleReset = () => {
    generateNextSquare();
    setScore(0);
    setTotal(0);
    setTime(MAX_TIME);
    setIsActiveGame(true);
  };

  return (
    <div className="flex flex-col items-center container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-2">
        Search That Square
      </h1>

      <div
        className={`${chessboardWidth} flex justify-between items-center py-2`}
      >
        <p className="w-24 text-center">Score: {score}</p>
        <p className="w-24 text-center">
          <span className="font-bold">
            {currentSquare} {nextSquare}
          </span>
        </p>
        <p className="w-24 text-center">
          {Math.floor(Math.ceil(time) / 60) < 10 ? "0" : ""}
          {Math.floor(Math.ceil(time) / 60)}:
          {Math.ceil(time) % 60 < 10 ? "0" : ""}
          {Math.ceil(time) % 60}
        </p>
      </div>

      <ChessboardWrapper>
        <Chessboard
          id="NotationTrainer"
          position={DEFAULT_POSITION}
          showBoardNotation={showCoordinates}
          boardOrientation={orientation}
          customBoardStyle={{ marginBottom: "20px" }}
          arePiecesDraggable={false}
          onSquareClick={handleSquareClick}
          customDndBackend={isMobile() ? TouchBackend : undefined}
        />
      </ChessboardWrapper>
      {!isPractice && (
        <Progress value={(time * 100) / MAX_TIME} className={chessboardWidth} />
      )}

      <div className="flex justify-center space-x-4 my-6">
        <Button
          onClick={() => {
            setIsPlaying(false);
          }}
        >
          Return to Instructions
        </Button>
      </div>
      <AlertDialog open={showPopup} onOpenChange={setShowPopup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Time's up!</AlertDialogTitle>
            <AlertDialogDescription>
              Your final score: {score} / {total}
            </AlertDialogDescription>
            <AlertDialogDescription>
              Your accuracy:{" "}
              {total === 0 ? "0.00%" : ((score / total) * 100).toFixed(2)}%
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleReset}>
              Restart Game
            </AlertDialogAction>
            <AlertDialogAction onClick={() => setIsPlaying(false)}>
              Back to Instructions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SearchSquareGame;
