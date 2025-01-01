import { useState, useEffect, useRef } from "react";
import {
  StockfishEvaluator,
  EvaluationUpdate,
} from "@/lib/stockfish/stockfish-eval";

const EvaluationDisplay = () => {
  const [evaluation, setEvaluation] = useState<number>(0);
  const [depth, setDepth] = useState<number>(0);
  const evaluator = useRef<StockfishEvaluator | null>(null);

  useEffect(() => {
    // Initialize evaluator
    evaluator.current = new StockfishEvaluator((update: EvaluationUpdate) => {
      setEvaluation(update.evaluation);
      setDepth(update.depth);
    });

    // Cleanup
    return () => {
      evaluator.current?.terminate();
    };
  }, []);

  // Function to format evaluation for display
  const formatEvaluation = (eval_: number): string => {
    if (Math.abs(eval_) >= 20000) {
      const mateIn = Math.ceil((20000 - Math.abs(eval_)) / 2);
      return `M${eval_ > 0 ? "+" : "-"}${mateIn}`;
    }
    return (eval_ / 100).toFixed(2);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg">
      <div className="text-2xl font-bold">
        {evaluation >= 0 ? "+" : ""}
        {formatEvaluation(evaluation)}
      </div>
      <div className="text-sm text-gray-600">Depth: {depth}</div>
    </div>
  );
};

export default EvaluationDisplay;
