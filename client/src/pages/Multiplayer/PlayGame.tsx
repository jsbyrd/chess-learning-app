import { useCallback, useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Button } from "@/components/ui/button";
import { Chess, DEFAULT_POSITION } from "chess.js";
import {
  BoardOrientation,
  PromotionPieceOption,
  Square,
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
import { useToast } from "@/hooks/use-toast";
import {
  EndGameState,
  getEndGameMessage,
  getEndGameState,
} from "@/lib/end-game-utils";
import { isMobile } from "@/lib/is-mobile";
import { TouchBackend } from "react-dnd-touch-backend";
import ChessboardWrapper from "@/components/ChessboardWrapper";
import axios from "axios";
import { useNavigate, useOutletContext, useSearchParams } from "react-router";
import { useUser } from "@/components/UserProvider/use-user-hook";
import { Socket } from "socket.io-client";

type GameMetaData = {
  gameId: string;
  numPlayers: number;
  p1: string;
  color1: string;
  p2: string;
  color2: string;
};

type OnUpdateGameMessage = {
  move: string;
  player: string;
};

const PlayGame = () => {
  const { toast } = useToast();
  const { username } = useUser();
  // const [position, setPosition] = useState<string>(defaultFen);
  const [chessState, setChessState] = useState<Chess>(
    new Chess(DEFAULT_POSITION)
  );
  const [playerOrientation, setPlayerOrientation] =
    useState<BoardOrientation>("white");
  const [opponentName, setOpponentName] = useState("UNKNOWN_ACCOUNT");
  const [endGameMessage, setEndGameMessage] = useState("");
  const [activeColor, setActiveColor] = useState<BoardOrientation>("white");
  const [showPopup, setShowPopup] = useState(false);
  const [isActiveGame, setIsActiveGame] = useState(true);
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get("gameId");
  const socket = useOutletContext() as Socket;
  const navigate = useNavigate();

  const fetchGameMetaData = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/games/ongoing/${gameId}`
      );

      console.log(res);

      if (!res) throw new Error("Something went wrong");
      const data = res.data as GameMetaData;

      // const data = JSON.parse(res.data) as GameMetaData;
      const isPlayer1 = data.p1 === username;

      setOpponentName(isPlayer1 ? data.p2 : data.p1);

      setPlayerOrientation(
        (isPlayer1 ? data.color1 : data.color2) as BoardOrientation
      );
    } catch (e) {
      navigate("/");
    }
  }, [gameId]);

  useEffect(() => {
    socket.on("onUpdateGame", (payload: string) => {
      const msg = JSON.parse(payload) as OnUpdateGameMessage;
      console.log(`${msg.player} played "${msg.move}"`);
      // Make move
      console.log("all moves", chessState.moves());
      chessState.move(msg.move);
      setChessState(chessState);
      setActiveColor(chessState.turn() === "w" ? "white" : "black");

      // Check for endgame
      const endGameState = getEndGameState(chessState);
      if (endGameState !== EndGameState.ACTIVE_GAME) {
        setIsActiveGame(false);
        setEndGameMessage(
          getEndGameMessage(endGameState, playerOrientation === activeColor)
        );
        setShowPopup(true);
        return;
      }
    });
    fetchGameMetaData();
  }, []);

  // useEffect(() => {
  //   if (endGameMessage !== "") {
  //     setShowPopup(true);
  //     // Navigate to Join/Create screen (currently, no "rematch" feature is planned)
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [endGameMessage]);

  // When we receive a move from websockets, update board state
  // useEffect(() => {
  //   if (!move) return;
  //   // Make move
  //   const updatedGameState = new Chess(position);
  //   updatedGameState.move(move);
  //   setPosition(updatedGameState.fen());
  //   setUserAnswer("");
  //   setActiveColor(updatedGameState.turn() === "w" ? "white" : "black");

  //   // Check for endgame
  //   const endGameState = getEndGameState(updatedGameState);
  //   if (endGameState !== EndGameState.ACTIVE_GAME) {
  //     setIsActiveGame(false);
  //     handleEndGameMessageChange(
  //       getEndGameMessage(endGameState, playerColor === activeColor)
  //     );
  //     // setShowPopup(true);
  //     return;
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const handleMoveDrop = (
    sourceSquare: string,
    targetSquare: string,
    promotionPiece: string
  ) => {
    console.log(sourceSquare, targetSquare, promotionPiece);
    try {
      // Simulate user's move
      const newGameState = new Chess(chessState.fen());
      newGameState.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: promotionPiece ? promotionPiece[1].toLowerCase() : "q",
      });

      const moveMade = newGameState.history()[0];

      // Emit game update message
      socket.emit("updateGame", {
        gameId: gameId,
        move: moveMade,
        player: username,
      });

      return true;
    } catch {
      return false;
    }
  };

  const handlePromotion = (
    piece: PromotionPieceOption | undefined,
    promoteFromSquare: Square | undefined,
    promoteToSquare: Square | undefined
  ) => {
    if (!piece || !promoteFromSquare || !promoteToSquare) {
      return false;
    }
    return handleMoveDrop(
      promoteFromSquare as string,
      promoteToSquare as string,
      piece as string
    );
  };

  return (
    <div className="flex flex-col items-center container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-6">
        Playing Against {opponentName}
      </h1>

      <ChessboardWrapper>
        <Chessboard
          id="NotationTrainer"
          position={chessState.fen()}
          showBoardNotation={true}
          boardOrientation={playerOrientation as BoardOrientation}
          customBoardStyle={{
            marginBottom: "20px",
          }}
          arePiecesDraggable={isActiveGame && activeColor === playerOrientation}
          onPieceDrop={handleMoveDrop}
          onPromotionPieceSelect={handlePromotion}
          customDndBackend={isMobile() ? TouchBackend : undefined}
        />
      </ChessboardWrapper>

      {/* <div className="flex justify-center space-x-4">
        <Button
          onClick={() => {
            navigate("/game/create")
          }}
        >
          Return to Create Game
        </Button>
        <Button
          onClick={() => {
            navigate("/game/join")
          }}
        >
          Return to Join Game
        </Button>
      </div> */}
      <AlertDialog open={showPopup} onOpenChange={setShowPopup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Game Over!</AlertDialogTitle>
            <AlertDialogDescription>{endGameMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* <AlertDialogAction onClick={handleReset}>
              Play Again
            </AlertDialogAction> */}
            <AlertDialogAction
              onClick={() => {
                navigate("/game/create");
              }}
            >
              Go to Create Game
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => {
                navigate("/game/join");
              }}
            >
              Go to Join Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlayGame;
