import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useOutletContext } from "react-router";
import { Socket } from "socket.io-client";
import { useUser } from "@/components/UserProvider/use-user-hook";
import { Input } from "@/components/ui/input";

type OnJoinGameMessage = {
  hasJoinedGame: boolean;
  gameId: string;
  msg: string | null;
};

type GameMetaData = {
  gameId: string;
  numPlayers: number;
  p1: string | null;
  color1: string | null;
  p2: string | null;
  color2: string | null;
};

const JoinGame = () => {
  const [gameId, setGameId] = useState<string>();
  const [isDisabled, setIsDisabled] = useState(false);
  const { username } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const socket = useOutletContext() as Socket;

  useEffect(() => {
    socket.on("onJoinGame", (payload: string) => {
      const res = JSON.parse(payload) as OnJoinGameMessage;
      toast({
        title: "Game Started!",
        description: res.msg,
      });
      setIsDisabled(false);
    });
    socket.on("onStartGame", (payload: string) => {
      const res = JSON.parse(payload) as GameMetaData;
      setIsDisabled(false);
      navigate(`/game/play?gameId=${res.gameId}`);
    });

    return () => {
      socket.off("onJoinGame"); // Join Game Failed
      socket.off("onStartGame"); // Join Game Succeeded
    };
  }, []);

  const handleJoinGame = async () => {
    setIsDisabled(true);
    socket.emit("joinGame", {
      username: username,
      gameId: gameId,
    });
    // From here, either onJoinGame message is heard (which means game wasn't joined, I know confusing right?), or user navigates to new page
  };

  return (
    <div className="flex flex-col items-center container mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create Game</CardTitle>
          <CardDescription>
            Enter your username below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label
                htmlFor="gameId"
                className="block text-sm font-medium mb-1"
              >
                Game ID
              </Label>
              <Input
                type="text"
                id="gameId"
                placeholder="Game ID"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              onClick={handleJoinGame}
              disabled={isDisabled}
              className="w-full"
            >
              Join Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinGame;
