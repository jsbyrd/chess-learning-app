import { FenProvider } from "@/components/FenProvider";
import { useState } from "react";
import MakeMoveGame, { MakeMoveGameProps } from "./MakeMoveGame";
import MakeMoveInstructions, {
  MakeMoveInstructionsProps,
} from "./MakeMoveInstructions";
import { ChessColor } from "@/lib/common-types";

const DEFAULT_COLOR: ChessColor = "white";

const MakeMove = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPractice, setIsPractice] = useState(false);
  const [selectedColor, setSelectedColor] = useState<ChessColor>(DEFAULT_COLOR);
  const [showCoordinates, setShowCoordinates] = useState(true);

  const instructionsProps: MakeMoveInstructionsProps = {
    setIsPlaying,
    setIsPractice,
    selectedColor,
    setSelectedColor,
    showCoordinates,
    setShowCoordinates,
  };

  const gameProps: MakeMoveGameProps = {
    setIsPlaying,
    selectedColor,
    isPractice,
    showCoordinates,
  };

  return (
    <FenProvider>
      {isPlaying ? (
        <MakeMoveGame {...gameProps} />
      ) : (
        <MakeMoveInstructions {...instructionsProps} />
      )}
    </FenProvider>
  );
};

export default MakeMove;
