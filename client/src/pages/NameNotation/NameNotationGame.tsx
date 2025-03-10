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
import { Input } from "@/components/ui/input";
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
import customAxios from "@/api/custom-axios";
import { useUser } from "@/components/UserProvider/use-user-hook";

const MAX_TIME = 60;
const DEFAULT_BORDER_COLOR = "border-inherit";
const CORRECT_BORDER_COLOR = "border-green-600";
const INCORRECT_BORDER_COLOR = "border-red-800";

export interface NameNotationGameProps {
  setIsPlaying: (isPlaying: boolean) => void;
  selectedColor: ChessColor;
  isPractice: boolean;
  showCoordinates: boolean;
}

const NameNotationGame = (props: NameNotationGameProps) => {
  const { setIsPlaying, selectedColor, isPractice, showCoordinates } = props;
  const user = useUser();
  const fen = useFen();
  const [time, setTime] = useState(MAX_TIME);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [position, setPosition] = useState<string | undefined>(undefined);
  const [move, setMove] = useState("");
  const [orientation, setOrientation] = useState<BoardOrientation>("white");
  const [showPopup, setShowPopup] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  // isActiveGame deals with whether there is an ongoing game, whereas isPlaying deals with whether the user should be on the instructions page or game page
  const [isActiveGame, setIsActiveGame] = useState(true);
  const [customArrows, setCustomArrows] = useState<Arrow[] | undefined>(
    undefined
  );
  const [userAnswer, setUserAnswer] = useState("");
  const [borderColor, setBorderColor] = useState("black");

  const generateNextPosition = () => {
    const randomPosition = fen.getRandomPosition(selectedColor);
    const newGameState = new Chess(randomPosition);
    setOrientation(newGameState.turn() === "w" ? "white" : "black");
    setPosition(randomPosition);
    getRandomMove(randomPosition);
  };

  // Generate first position in the game
  useEffect(() => {
    generateNextPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswerSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    setIsButtonDisabled(true);
    setTotal(total + 1);

    if (userAnswer.toLowerCase() === move.toLowerCase() && move !== "") {
      setScore(score + 1);
      setBorderColor(CORRECT_BORDER_COLOR);
    } else {
      setScore(score - 1);
      setBorderColor(INCORRECT_BORDER_COLOR);
    }

    setTimeout(() => {
      generateNextPosition();
      setUserAnswer("");
      setBorderColor(DEFAULT_BORDER_COLOR);
      setIsButtonDisabled(false);
    }, 500);
  };

  // Create game stats when game is over
  useEffect(() => {
    const handleCreateGameStats = async () => {
      if (time === 0 && user.isLoggedIn) {
        // TODO: Remove magic strings
        await customAxios.post("/minigame-stats", {
          game: "NAMENOTATION",
          score: score,
          total: total,
        });
      }
    };

    handleCreateGameStats();
  }, [score, time, total, user.isLoggedIn, user.username]);

  // Handle time limit for non-practice games
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
  }, [isActiveGame, isPractice, score]);

  // Create MmAnalytics when game is over
  // useEffect(() => {
  //   const handleCreateMmAnalytics = async () => {
  //     if (time === 0 && user.isLoggedIn) {
  //       await createMmAnalytics(user.username, user.password, score, total);
  //     }
  //   };

  //   handleCreateMmAnalytics();
  // }, [score, time, total, user.isLoggedIn, user.password, user.username]);

  // Returns true if move involves a check, checkmate, or castling
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

  const handleReset = () => {
    generateNextPosition();
    setScore(0);
    setTotal(0);
    setTime(MAX_TIME);
    setIsActiveGame(true);
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(e.target.value);
  };

  return (
    <div className="flex flex-col items-center container mx-auto px-4 max-w-3xl">
      {/* <h1 className="text-3xl font-bold text-center mb-2">
        Name That Notation
      </h1> */}

      <div
        className={`${chessboardWidth} flex justify-between items-center py-2`}
      >
        <p className="w-24 text-center">Score: {score}</p>
        {isPractice ? (
          <p className="w-24 text-center"></p>
        ) : (
          <p className="w-24 text-center">
            {Math.floor(Math.ceil(time) / 60) < 10 ? "0" : ""}
            {Math.floor(Math.ceil(time) / 60)}:
            {Math.ceil(time) % 60 < 10 ? "0" : ""}
            {Math.ceil(time) % 60}
          </p>
        )}
      </div>

      <form
        onSubmit={handleAnswerSubmission}
        className={`flex gap-3 ${chessboardWidth}`}
      >
        <Input
          className={`${chessboardWidth} mb-4 border-2 border-solid ${borderColor}`}
          placeholder="Move"
          value={userAnswer}
          onChange={handleAnswerChange}
        />
        <Button
          className="flex-none basis-1/12 bg-green-600 hover:bg-green-500"
          type="submit"
          disabled={isButtonDisabled}
        >
          Submit
        </Button>
      </form>

      <ChessboardWrapper>
        <Chessboard
          id="NotationTrainer"
          position={position ?? DEFAULT_POSITION}
          showBoardNotation={showCoordinates}
          boardOrientation={orientation}
          customBoardStyle={{ marginBottom: "20px" }}
          customArrows={customArrows ?? ([] as Arrow[])}
          customDndBackend={isMobile() ? TouchBackend : undefined}
          arePiecesDraggable={false}
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
            <AlertDialogTitle>Name That Notation Results</AlertDialogTitle>
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

export default NameNotationGame;
