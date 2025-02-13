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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GameColor, OnCreateGameMessage } from "./types";

const CreateGame = () => {
  const [colorPreference, setColorPreference] = useState<GameColor>("white");
  const [timeControl, setTimeControl] = useState<string>("10|0");
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

  const handleCreateGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let color = colorPreference;
    if (color === "random") {
      color = Math.random() < 0.5 ? "white" : "black";
    }
    let time: string | null = timeControl;
    if (time === "unlimited") {
      time = null;
    }
    socket.emit("createGame", {
      username: username,
      color: color,
      time: time,
    });
  };

  return (
    <div className="flex flex-col items-center container mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create Game</CardTitle>
          <CardDescription>
            Select your desired game options and press the button below to
            create your game
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateGame} className="space-y-6">
            <div>
              <Label>Time Controls</Label>
              <Select
                value={timeControl}
                onValueChange={(value) => {
                  setTimeControl(value);
                }}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a time control" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>No Time Limit</SelectLabel>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Blitz</SelectLabel>
                    <SelectItem value="1|0">1 | 0</SelectItem>
                    <SelectItem value="1|1">1 | 1</SelectItem>
                    <SelectItem value="3|0">3 | 0</SelectItem>
                    <SelectItem value="3|2">3 | 2</SelectItem>
                    <SelectItem value="5|0">5 | 0</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Rapid</SelectLabel>
                    <SelectItem value="10|0">10 | 0</SelectItem>
                    <SelectItem value="10|5">10 | 5</SelectItem>
                    <SelectItem value="15|10">15 | 10</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Classical</SelectLabel>
                    <SelectItem value="90|30">90 | 30</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3">
              <Label>Choose Your Color</Label>
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

            <Button type="submit" className="w-full">
              Create Game
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateGame;
