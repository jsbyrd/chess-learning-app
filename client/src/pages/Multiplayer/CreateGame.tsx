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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate, useOutletContext } from "react-router";
import { Socket } from "socket.io-client";
import { useUser } from "@/components/UserProvider/use-user-hook";

type GameColor = "white" | "black" | "random";
type OnCreateGameMessage = {
  hasCreatedGame: boolean;
  gameId: string;
  msg: string | null;
};

const CreateGame = () => {
  const [colorPreference, setColorPreference] = useState<GameColor>("white");
  const { username } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const socket = useOutletContext() as Socket;

  useEffect(() => {
    socket.on("onCreateGame", (payload: string) => {
      const res = JSON.parse(payload) as OnCreateGameMessage;

      if (res.hasCreatedGame) {
        toast({
          title: "Game Created",
          description:
            "Your game has been created. Send the Game ID as shown to your opponent so that they can join the game.",
        });
        navigate(`/game/wait?gameId=${res.gameId}`);
      } else {
        toast({
          title: "Error",
          variant: "destructive",
          description: res.msg,
        });
      }
    });

    return () => {
      socket.off("onCreateGame");
    };
  }, []);

  const handleCreateGame = () => {
    let color = colorPreference;
    if (color === "random") {
      color = Math.random() < 0.5 ? "white" : "black";
    }
    socket.emit("createGame", {
      username: username,
      color: color,
    });
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
            <div className="flex flex-col gap-3">
              <p className="text-md">Choose your color:</p>
              <RadioGroup
                defaultValue={colorPreference}
                onValueChange={(value) => {
                  setColorPreference(value as GameColor);
                }}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="white" id="white" />
                  <Label htmlFor="white">White</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="black" id="black" />
                  <Label htmlFor="black">Black</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="random" id="random" />
                  <Label htmlFor="random">Random</Label>
                </div>
              </RadioGroup>
            </div>
            <Button onClick={handleCreateGame} className="w-full">
              Create Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateGame;
