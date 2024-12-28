"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Chess, Square, DEFAULT_POSITION } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { AvailableBots, InitialisedBot } from "@/lib/stockfish/bots";
import bots from "@/lib/stockfish/bots";

type SelectedBot = {
  name: string;
  move: InitialisedBot;
} | null;

export default function WatchAI() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [fen, setFen] = useState<string>(DEFAULT_POSITION);
  const [whiteBot, setWhiteBot] = useState<SelectedBot>(null);
  const [blackBot, setBlackBot] = useState<SelectedBot>(null);
  const [chess, setChess] = useState<Chess>(new Chess(DEFAULT_POSITION));
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const makeBotMove = async () => {
    if (chess.isGameOver() || isProcessing) {
      console.log("Game over or move in progress");
      return;
    }

    const currentTurn = chess.turn();
    const bot = currentTurn === "w" ? whiteBot : blackBot;

    if (bot && isPlaying) {
      try {
        setIsProcessing(true);
        console.log("Making move for", currentTurn);
        const { from, to } = await bot.move(chess.fen());

        const move = chess.move({ from, to });
        if (move) {
          const newFen = chess.fen();
          setFen(newFen);
          setChess(new Chess(newFen));
        }
      } catch (error) {
        console.error("Bot move failed:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPlaying && !isProcessing) {
        makeBotMove();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isPlaying, fen, isProcessing]);

  const handleReset = () => {
    setIsPlaying(false);
    setChess(new Chess());
    setFen(DEFAULT_POSITION);
  };

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="flex gap-2 mb-4">
        <Select
          onValueChange={(name: string) => {
            setWhiteBot(name ? { name, move: bots[name]() } : null);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="White AI" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(bots).map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(name: string) => {
            setBlackBot(name ? { name, move: bots[name]() } : null);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Black AI" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(bots).map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => setIsPlaying((playing) => !playing)}>
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button onClick={handleReset}>Reset</Button>
      </div>

      <div className="sm:w-[50%] lg:w-[35%]">
        <Chessboard position={chess.fen()} arePiecesDraggable={false} />
      </div>
    </div>
  );
}
