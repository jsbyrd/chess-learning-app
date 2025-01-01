"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Chess, DEFAULT_POSITION } from "chess.js";
import { Chessboard } from "react-chessboard";
import StockfishWorkerManager from "@/lib/stockfish/stockfish-worker";
import {
  StockfishEvaluator,
  EvaluationUpdate,
} from "@/lib/stockfish/stockfish-eval";
import GameOptions from "./game-options";
// import EvaluationDisplay from "@/components/eval-display";

export default function WatchAI() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [fen, setFen] = useState<string>(DEFAULT_POSITION);
  const [chess, setChess] = useState<Chess>(new Chess(DEFAULT_POSITION));
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [depth, setDepth] = useState<number>(0);
  const [evaluation, setEvaluation] = useState<number>(0);
  const whiteBotRef = useRef<StockfishWorkerManager>(null);
  const blackBotRef = useRef<StockfishWorkerManager>(null);
  const evaluationBot = useRef<StockfishEvaluator>(null);

  const handleEvaluationUpdate = useCallback((update: EvaluationUpdate) => {
    setEvaluation(update.evaluation);
    setDepth(update.depth);
  }, []);

  // Cleanup bots when leaving page
  useEffect(() => {
    evaluationBot.current = new StockfishEvaluator(handleEvaluationUpdate);
    whiteBotRef.current = new StockfishWorkerManager();
    blackBotRef.current = new StockfishWorkerManager();

    return () => {
      evaluationBot.current?.terminate();
      whiteBotRef.current?.terminate();
      blackBotRef.current?.terminate();
    };
  }, []);

  const makeBotMove = async () => {
    if (chess.isGameOver() || isProcessing) {
      console.log("Game over or move in progress");
      return;
    }

    const currentTurn = chess.turn();
    const bot = currentTurn === "w" ? whiteBotRef.current : blackBotRef.current;

    if (bot && isPlaying) {
      try {
        setIsProcessing(true);
        console.log("Making move for", currentTurn);
        const { from, to } = await bot.makeMove(chess.fen());
        const move = chess.move({ from, to, promotion: "q" });
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
        evaluationBot.current?.startAnalysis(fen);
        makeBotMove();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isPlaying, fen, isProcessing]);

  const handleReset = () => {
    setIsPlaying(false);
    setChess(new Chess());
    setFen(DEFAULT_POSITION);
    blackBotRef.current?.reset();
    whiteBotRef.current?.reset();
    evaluationBot.current?.reset();
    setDepth(0);
    setEvaluation(0);
  };

  return (
    <div className="flex flex-col justify-center items-center h-full gap-4">
      <GameOptions
        blackBot={blackBotRef.current}
        whiteBot={whiteBotRef.current}
        handleReset={handleReset}
        setIsPlaying={setIsPlaying}
        isPlaying={isPlaying}
      />
      <div className="sm:w-[50%]">
        <Chessboard position={chess.fen()} arePiecesDraggable={false} />
      </div>
      <p>{`Depth: ${depth}, Eval: ${evaluation}`}</p>
    </div>
  );
}
