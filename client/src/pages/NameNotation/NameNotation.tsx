import { FenProvider } from "@/components/FenProvider";
import { useState } from "react";
import { ChessColor } from "@/lib/common-types";
import NameNotationInstructions, {
  NameNotationInstructionProps,
} from "./NameNotationInstructions";
import NameNotationGame, { NameNotationGameProps } from "./NameNotationGame";

const DEFAULT_COLOR: ChessColor = "white";

const NameNotation = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPractice, setIsPractice] = useState(false);
  const [selectedColor, setSelectedColor] = useState<ChessColor>(DEFAULT_COLOR);
  const [showCoordinates, setShowCoordinates] = useState(true);

  const instructionsProps: NameNotationInstructionProps = {
    setIsPlaying,
    setIsPractice,
    selectedColor,
    setSelectedColor,
    showCoordinates,
    setShowCoordinates,
  };

  const gameProps: NameNotationGameProps = {
    setIsPlaying,
    selectedColor,
    isPractice,
    showCoordinates,
  };

  return (
    <FenProvider>
      {isPlaying ? (
        <NameNotationGame {...gameProps} />
      ) : (
        <NameNotationInstructions {...instructionsProps} />
      )}
    </FenProvider>
  );
};

export default NameNotation;
