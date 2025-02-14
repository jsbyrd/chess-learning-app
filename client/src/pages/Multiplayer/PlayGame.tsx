import { useCallback, useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, DEFAULT_POSITION } from "chess.js";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  GameMetaData,
  OnPlayerQuitMessage,
  OnRematchGameMessage,
  OnUpdateGameMessage,
} from "./types";
import { formatTime } from "@/lib/format-time";
import { getTimerColor } from "@/lib/get-timer-color";

const PlayGame = () => {
  // const { toast } = useToast();
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
  const [originalGameData, setOriginalGameData] = useState<GameMetaData | null>(
    null
  );
  const [isTimedGame, setIsTimedGame] = useState(false);
  const [whiteTime, setWhiteTime] = useState<number>(0);
  const [blackTime, setBlackTime] = useState<number>(0);
  const [timeIncrement, setTimeIncrement] = useState<number>(0);
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get("gameId");
  const socket = useOutletContext() as Socket;
  const navigate = useNavigate();
  const opponentColor = playerOrientation === "white" ? "black" : "white";

  const fetchGameMetaData = useCallback(async () => {
    try {
      const res = await customAxios.get(`/games/ongoing/${gameId}`);

      if (!res) throw new Error("Something went wrong");
      const data = res.data as GameMetaData;
      setOriginalGameData(data);
      console.log(data);

      // Process game meta data
      if (data.time) {
        const timeAndIncrement = data.time.split("|");
        const startingTime = parseInt(timeAndIncrement[0]) * 60 * 1000;
        setWhiteTime(startingTime);
        setBlackTime(startingTime);
        setTimeIncrement(parseInt(timeAndIncrement[1]) * 1000);
        setIsTimedGame(true);
        console.log(timeAndIncrement);
      }

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

        if (isTimedGame && activeColor === "white") {
          console.log("white increments by", timeIncrement);
          setWhiteTime((prevTime) => prevTime + timeIncrement);
        }
        if (isTimedGame && activeColor === "black") {
          console.log("black increments by", timeIncrement);
          setBlackTime((prevTime) => prevTime + timeIncrement);
        }

        setActiveColor(updatedGameState.turn() === "w" ? "white" : "black");
        return updatedGameState.fen();
      });
    };

    socket.on("onUpdateGame", handleGameUpdate);

    return () => {
      socket.off("onUpdateGame", handleGameUpdate);
    };
  }, [activeColor, isTimedGame]);

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

  // Used for cycling dots on end game screen
  useEffect(() => {
    if (!showPopup) return;

    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, [showPopup]);

  // Reset game for rematch
  useEffect(() => {
    if (userWantsRematch && opponentWantsRematch && originalGameData) {
      const timeAndIncrement = originalGameData.time?.split("|");
      if (timeAndIncrement) {
        const startingTime = parseInt(timeAndIncrement[0]) * 60 * 1000;
        setWhiteTime(startingTime);
        setBlackTime(startingTime);
      }
      setUserWantsRematch(false);
      setOpponentWantsRematch(false);
      setPosition(DEFAULT_POSITION);
      setAlertDialogFooterContent("");
      setActiveColor("white");
      setShowPopup(false);
      setIsActiveGame(true);
    }
  }, [userWantsRematch, opponentWantsRematch, originalGameData]);

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

  // Handle timers
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!isActiveGame || !isTimedGame) return;

    timer = setInterval(() => {
      if (activeColor === "white") {
        setWhiteTime((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            setIsActiveGame(false);
            setEndGameMessage(
              playerOrientation === "black"
                ? "You WIN on time"
                : "You LOSE on time"
            );
            setShowPopup(true);
            return 0;
          }
          return prev - 100;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            setIsActiveGame(false);
            setEndGameMessage(
              playerOrientation === "white"
                ? "You WIN on time"
                : "You LOSE on time"
            );
            setShowPopup(true);
            return 0;
          }
          return prev - 100;
        });
      }
    }, 100);

    return () => clearInterval(timer);
  }, [activeColor, isActiveGame, isTimedGame]);

  return (
    <div className="flex flex-col items-center container mx-auto px-4 py-8 max-w-3xl">
      <ChessboardWrapper className="gap-2">
        <div className="flex justify-between items-center">
          <p>{opponentName}</p>
          <div
            className={`px-2 py-1 rounded-sm ${getTimerColor(
              opponentColor,
              activeColor,
              isTimedGame
            )}`}
          >
            {isTimedGame && playerOrientation === "white"
              ? formatTime(blackTime)
              : formatTime(whiteTime)}
          </div>
        </div>
        <Chessboard
          id="NotationTrainer"
          position={position}
          showBoardNotation={true}
          boardOrientation={playerOrientation as BoardOrientation}
          arePiecesDraggable={isActiveGame && activeColor === playerOrientation}
          onPieceDrop={handleMoveDrop}
          customDndBackend={isMobile() ? TouchBackend : undefined}
        />
        <div className="flex justify-between items-center">
          <p>{username}</p>
          <div
            className={`px-2 py-1 rounded-sm ${getTimerColor(
              playerOrientation,
              activeColor,
              isTimedGame
            )}`}
          >
            {isTimedGame && playerOrientation === "white"
              ? formatTime(whiteTime)
              : formatTime(blackTime)}
          </div>
        </div>
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
