import { useCallback, useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
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
import { Button } from "@/components/ui/button";

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
  const [position, setPosition] = useState<string>(DEFAULT_POSITION);
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

      if (!res) throw new Error("Something went wrong");
      const data = res.data as GameMetaData;

      const isPlayer1 = data.p1 === username;

      setOpponentName(isPlayer1 ? data.p2 : data.p1);
      setPlayerOrientation(
        (isPlayer1 ? data.color1 : data.color2) as BoardOrientation
      );
      setPosition(
        "rnbqkbnr/1ppppppp/8/4P3/3P4/7P/PpP2PP1/RNBQKBNR b KQkq - 0 5"
      );
      const updatedGameState = new Chess(
        "rnbqkbnr/1ppppppp/8/4P3/3P4/7P/PpP2PP1/RNBQKBNR b KQkq - 0 5"
      );
      setActiveColor(updatedGameState.turn() === "w" ? "white" : "black");
      setIsActiveGame(true);
      setEndGameMessage("");
      setShowPopup(false);
    } catch (e) {
      navigate("/");
    }
  }, [username, gameId, navigate]);

  useEffect(() => {
    const handleGameUpdate = (payload: string) => {
      const msg = JSON.parse(payload) as OnUpdateGameMessage;
      console.log(`${msg.player} played "${msg.move}"`);
      console.log("position before: " + position);

      setPosition((currentPosition) => {
        console.log("position after: " + position);
        console.log("current position: " + currentPosition);
        const updatedGameState = new Chess(currentPosition);
        updatedGameState.move(msg.move);

        // Check for endgame
        const endGameState = getEndGameState(updatedGameState);
        if (endGameState !== EndGameState.ACTIVE_GAME) {
          setIsActiveGame(false);
          setEndGameMessage(
            getEndGameMessage(endGameState, username === msg.player)
          );
          setShowPopup(true);
        }

        setActiveColor(updatedGameState.turn() === "w" ? "white" : "black");
        return updatedGameState.fen();
      });
    };

    socket.on("onUpdateGame", handleGameUpdate);
    fetchGameMetaData();

    return () => {
      socket.off("onUpdateGame");
    };
  }, [socket, username, fetchGameMetaData]);

  const handleMoveDrop = (
    sourceSquare: string,
    targetSquare: string,
    promotionPiece: string
  ) => {
    try {
      // Use current position state to make the move
      const newGameState = new Chess(position);
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

  return (
    <div className="flex flex-col items-center container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-6">
        Playing Against {opponentName}
        <Button
          onClick={() => {
            console.log(position);
          }}
        >
          Get Fen
        </Button>
        <Button
          onClick={() => {
            const game = new Chess(position);
            console.log(game.moves());
          }}
        >
          Get Moves
        </Button>
      </h1>

      <ChessboardWrapper>
        <Chessboard
          id="NotationTrainer"
          position={position}
          showBoardNotation={true}
          boardOrientation={playerOrientation as BoardOrientation}
          customBoardStyle={{
            marginBottom: "20px",
          }}
          arePiecesDraggable={isActiveGame && activeColor === playerOrientation}
          onPieceDrop={handleMoveDrop}
          customDndBackend={isMobile() ? TouchBackend : undefined}
        />
      </ChessboardWrapper>

      <AlertDialog open={showPopup} onOpenChange={setShowPopup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Game Over!</AlertDialogTitle>
            <AlertDialogDescription>{endGameMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
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
