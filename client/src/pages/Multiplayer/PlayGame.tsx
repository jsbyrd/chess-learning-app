import { useCallback, useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, DEFAULT_POSITION } from "chess.js";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
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
import { useNavigate, useOutletContext, useSearchParams } from "react-router";
import { useUser } from "@/components/UserProvider/use-user-hook";
import { Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import customAxios from "@/api/custom-axios";

type GameMetaData = {
  gameId: string;
  numPlayers: number;
  p1: string;
  color1: string;
  p2: string;
  color2: string;
};

type OnUpdateGameMessage = {
  type: "onUpdateGame";
  move: string;
  player: string;
};

type OnRematchGameMessage = {
  type: "onRematchGame";
  player: string;
};

type OnPlayerQuitMessage = {
  type: "onPlayerQuit";
  gameId: string;
  msg: string;
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
  const [userWantsRematch, setUserWantsRematch] = useState(false);
  const [opponentWantsRematch, setOpponentWantsRematch] = useState(false);
  const [isOpponentActive, setIsOpponentActive] = useState(true);
  const [dots, setDots] = useState(0);
  const [alertDialogFooterContent, setAlertDialogFooterContent] = useState("");
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get("gameId");
  const socket = useOutletContext() as Socket;
  const navigate = useNavigate();

  const fetchGameMetaData = useCallback(async () => {
    try {
      const res = await customAxios.get(`/games/ongoing/${gameId}`);

      if (!res) throw new Error("Something went wrong");
      const data = res.data as GameMetaData;
      console.log(data);

      const isPlayer1 = data.p1 === username;

      setOpponentName(isPlayer1 ? data.p2 : data.p1);
      setPlayerOrientation(
        (isPlayer1 ? data.color1 : data.color2) as BoardOrientation
      );
      const updatedGameState = new Chess(DEFAULT_POSITION);
      setActiveColor(updatedGameState.turn() === "w" ? "white" : "black");
      setIsActiveGame(true);
      setEndGameMessage("");
      setShowPopup(false);
    } catch (e) {
      navigate("/");
    }
  }, [username, gameId, navigate]);

  // Fetch game data on initial render. Send "quit" message on component unmount
  useEffect(() => {
    fetchGameMetaData();

    return () => {
      socket.emit("playerQuit", {
        username: username,
        gameId: gameId,
      });
    };
  }, []);

  // Handle Game/Move Update Messages
  useEffect(() => {
    const handleGameUpdate = (payload: string) => {
      const msg = JSON.parse(payload) as OnUpdateGameMessage;

      setPosition((currentPosition) => {
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

    return () => {
      socket.off("onUpdateGame", handleGameUpdate);
    };
  }, []);

  // Handle Rematch Messages
  useEffect(() => {
    const handleRematchGame = (payload: string) => {
      const msg = JSON.parse(payload) as OnRematchGameMessage;
      if (msg.player === username) {
        setUserWantsRematch(true);
      } else {
        setAlertDialogFooterContent(`${opponentName} is waiting for a rematch`);
        setOpponentWantsRematch(true);
      }
    };

    socket.on("onRematchGame", handleRematchGame);

    return () => {
      socket.off("onRematchGame", handleRematchGame);
    };
  }, [opponentName, dots]);

  // Handle when opponent quits (stop game if game is active, handle endgame message/rematch button is game is over)
  useEffect(() => {
    const handleOpponentQuitGame = (payload: string) => {
      const msg = JSON.parse(payload) as OnPlayerQuitMessage;
      setOpponentWantsRematch(false);
      setIsOpponentActive(false);
      if (isActiveGame) setEndGameMessage(msg.msg);
      if (showPopup) setAlertDialogFooterContent(`${opponentName} has left.`);
      setIsActiveGame(false);
      setShowPopup(true);
    };

    socket.on("onPlayerQuit", handleOpponentQuitGame);

    return () => {
      socket.off("onPlayerQuit", handleOpponentQuitGame);
    };
  }, [opponentName, showPopup, isActiveGame]);

  useEffect(() => {
    if (!showPopup) return;

    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, [showPopup]);

  useEffect(() => {
    // Reset game for rematch
    if (userWantsRematch && opponentWantsRematch) {
      setUserWantsRematch(false);
      setOpponentWantsRematch(false);
      setPosition(DEFAULT_POSITION);
      setAlertDialogFooterContent("");
      setActiveColor("white");
      setShowPopup(false);
      setIsActiveGame(true);
    }
  }, [userWantsRematch, opponentWantsRematch]);

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
        {/* <Button
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
        </Button> */}
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
            <AlertDialogDescription>
              <div className="flex flex-col gap-5">
                <p>{endGameMessage}</p>
                <div className="flex justify-between">
                  <Button
                    onClick={() => {
                      navigate("/");
                    }}
                  >
                    Leave Game
                  </Button>
                  <Button
                    onClick={() => {
                      socket.emit("rematchGame", {
                        username: username,
                        gameId: gameId,
                      });
                    }}
                    disabled={
                      !isOpponentActive ||
                      (isOpponentActive && userWantsRematch)
                    }
                  >
                    Rematch
                  </Button>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="justify-end">
            {alertDialogFooterContent}
            {opponentWantsRematch && isOpponentActive && ".".repeat(dots)}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlayGame;
