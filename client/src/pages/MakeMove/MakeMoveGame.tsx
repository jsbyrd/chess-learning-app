import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFen } from "@/components/FenProvider";
import { Chess, DEFAULT_POSITION } from "chess.js";
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
import { useUser } from "@/components/UserProvider/use-user-hook";
import customAxios from "@/api/custom-axios";
// import { createMmAnalytics } from "@/services/mmAnalyticsService";
// import { useUser } from "@/components/UserProvider";

const MAX_TIME = 60;

export interface MakeMoveGameProps {
  setIsPlaying: (isPlaying: boolean) => void;
  selectedColor: ChessColor;
  isPractice: boolean;
  showCoordinates: boolean;
}

const MakeMoveGame = (props: MakeMoveGameProps) => {
  const { setIsPlaying, selectedColor, isPractice, showCoordinates } = props;
  const user = useUser();
  const fen = useFen();
  const [time, setTime] = useState(MAX_TIME);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState<string | undefined>(undefined);
  const [move, setMove] = useState("");
  const [orientation, setOrientation] = useState<BoardOrientation>("white");
  const [showPopup, setShowPopup] = useState(false);
  // isActiveGame deals with whether there is an ongoing game, whereas isPlaying deals with whether the user should be on the instructions page or game page
  const [isActiveGame, setIsActiveGame] = useState(true);
  const [customArrows, setCustomArrows] = useState<Arrow[] | undefined>(
    undefined
  );
  const [showCustomArrows, setShowCustomArrows] = useState<boolean>(false);

  const generateNextPosition = () => {
    const randomPosition = fen.getRandomPosition(selectedColor);
    const newGameState = new Chess(randomPosition);
    setOrientation(newGameState.turn() === "w" ? "white" : "black");
    setGame(newGameState);
    setPosition(randomPosition);
    getRandomMove(randomPosition);
    setShowCustomArrows(false);
  };

  useEffect(() => {
    generateNextPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isActiveGame || isPractice) return;

    const handleInterval = () => {
      setTime((prevTime) => {
        // Switch off game when time goes to 0
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

  // Create game stats when game is over
  useEffect(() => {
    const handleCreateGameStats = async () => {
      if (time === 0 && user.isLoggedIn) {
        // TODO: Remove magic strings
        await customAxios.post("/minigame-stats", {
          game: "MAKEMOVE",
          score: score,
          total: total,
        });
      }
    };

    handleCreateGameStats();
  }, [score, time, total, user.isLoggedIn, user.username]);

  // Returns true if it involves a check, checkmate, or castling
  const isSpecialMove = (move: string) => {
    return move.includes("+") || move.includes("#") || move.includes("-");
  };

  const getRandomMove = (fen: string) => {
    const chess = new Chess(fen);
    const moves = chess.moves();
    const verboseMoves = chess.moves({ verbose: true });

    const specialMoves = moves.filter((move) => isSpecialMove(move));

    let chosenMove;
    // Prioritize "special" moves for a more even distribution of moves
    if (specialMoves.length > 0 && Math.random() < 0.2) {
      chosenMove =
        specialMoves[Math.floor(Math.random() * specialMoves.length)];
    } else {
      chosenMove = moves[Math.floor(Math.random() * moves.length)];
    }

    // Generate arrows that will be shown after user makes move
    setMove(chosenMove);
    const verboseMove = verboseMoves.find((move) => move.san === chosenMove);

    if (!verboseMove) throw new Error(`Verbose move for ${move} doesn't exist`);

    setCustomArrows([[verboseMove.from, verboseMove.to, "green"]]);
  };

  const handleMoveDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      // Simulate user's move
      const newGameState = new Chess(game.fen());
      newGameState.move({ from: sourceSquare, to: targetSquare });
      setGame(newGameState);
      setPosition(newGameState.fen());

      // Get fen from making the correct move
      const gameCopyAnswer = new Chess(game.fen());
      gameCopyAnswer.move(move);
      const correctAnswer = gameCopyAnswer.fen();

      // Compare correct answer to the fen generated by user's move
      let customArrowColor;
      if (newGameState.fen() === correctAnswer) {
        setScore(score + 1);
        customArrowColor = "green";
      } else {
        setScore(score - 1);
        customArrowColor = "red";
      }
      setTotal(total + 1);

      let newCustomArrow = undefined;
      if (customArrows && customArrows.length > 0) {
        newCustomArrow = [
          customArrows[0].map((val, idx) =>
            idx === 2 ? customArrowColor : val
          ),
        ];
      }

      setCustomArrows(newCustomArrow as Arrow[]);
      setShowCustomArrows(true);

      setTimeout(() => {
        generateNextPosition();
        setShowCustomArrows(false);
      }, 500);

      return true;
    } catch {
      // Illegal move (i.e. moving a black piece when it is white's turn), don't count it
      return false;
    }
  };

  const handleReset = () => {
    generateNextPosition();
    setScore(0);
    setTotal(0);
    setTime(MAX_TIME);
    setIsActiveGame(true);
  };

  return (
    <div className="flex flex-col items-center container mx-auto px-4 max-w-3xl">
      <div
        className={`${chessboardWidth} flex justify-between items-center py-2`}
      >
        <p className="w-24 text-center">Score: {score}</p>
        <p className="w-24 text-center">
          {orientation.charAt(0)}: <span className="font-bold">{move}</span>
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
          position={position ?? DEFAULT_POSITION}
          showBoardNotation={showCoordinates}
          boardOrientation={orientation}
          customBoardStyle={{ marginBottom: "20px" }}
          onPieceDrop={handleMoveDrop}
          customArrows={showCustomArrows ? customArrows : ([] as Arrow[])}
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
            <AlertDialogTitle>Make That Move Results</AlertDialogTitle>
            <AlertDialogDescription>
              Your final score: {score}
            </AlertDialogDescription>
            <AlertDialogDescription>
              Correct Guesses: {(total + score) / 2}
            </AlertDialogDescription>
            <AlertDialogDescription>
              Incorrect Guesses: {(total - score) / 2}
            </AlertDialogDescription>
            <AlertDialogDescription>
              Total Guesses: {total}
            </AlertDialogDescription>
            <AlertDialogDescription>
              Your accuracy:{" "}
              {total === 0
                ? "0.00"
                : (((total + score) / 2 / total) * 100).toFixed(2)}
              %
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

export default MakeMoveGame;
