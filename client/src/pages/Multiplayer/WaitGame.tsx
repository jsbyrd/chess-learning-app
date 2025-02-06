import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useOutletContext, useSearchParams } from "react-router";
import { Socket } from "socket.io-client";

type GameMetaData = {
  gameId: string;
  numPlayers: number;
  p1: string | null;
  color1: string | null;
  p2: string | null;
  color2: string | null;
};

const WaitGame = () => {
  const [dots, setDots] = useState(0);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const gameId = searchParams.get("gameId");
  const socket = useOutletContext() as Socket;

  useEffect(() => {
    if (!gameId) {
      toast({
        title: "Error",
        description:
          "Redirecting to Create Game since no valid gameId was included in the URL.",
      });
      navigate("/game/create");
    }

    // Todo: Check if gameId is actually valid

    socket.on("onCreateGame", (payload: string) => {
      const res = JSON.parse(payload) as GameMetaData;
      console.log(res);
    });

    return () => {
      socket.off("onCreateGame");
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(gameId as string)
      .then(() => {
        toast({
          title: "Success!",
          description:
            "The Game ID has been successfully copied to your clipboard.",
        });
      })
      .catch(() => {
        toast({
          title:
            "Error: Something went wrong when trying to copy the Game ID onto your clipboard.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <div className="p-8 rounded-xl shadow-md max-w-md w-full space-y-6">
        <h1 className="text-3xl font-bold text-center">
          Waiting for player to join
          {".".repeat(dots)}
        </h1>

        <div className="flex justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
        </div>

        <div className="p-4 rounded-md">
          <p className="text-sm mb-2">Game ID:</p>
          <div className="flex items-center space-x-2">
            <code className="flex-grow p-2 rounded border font-mono text-sm">
              {gameId}
            </code>
            <Button
              onClick={copyToClipboard}
              variant="secondary"
              className="whitespace-nowrap"
            >
              Copy ID
            </Button>
          </div>
        </div>

        <p className="text-center text-sm">
          Share this Game ID with your opponent to start the game.
        </p>
      </div>
    </div>
  );
};

export default WaitGame;
