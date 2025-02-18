import { useState } from "react";
import SearchSquareGame, { SearchSquareGameProps } from "./SearchSquareGame";
import SearchSquareInstructions, {
  SearchSquareInstructionsProps,
} from "./SearchSquareInstructions";
import { ChessColor } from "@/lib/common-types";

const DEFAULT_COLOR: ChessColor = "white";

const SearchSquare = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPractice, setIsPractice] = useState(false);
  const [selectedColor, setSelectedColor] = useState<ChessColor>(DEFAULT_COLOR);
  const [showCoordinates, setShowCoordinates] = useState(true);

  const instructionsProps: SearchSquareInstructionsProps = {
    setIsPlaying,
    setIsPractice,
    selectedColor,
    setSelectedColor,
    showCoordinates,
    setShowCoordinates,
  };

  const gameProps: SearchSquareGameProps = {
    setIsPlaying,
    selectedColor,
    isPractice,
    showCoordinates,
  };

  return (
    <>
      {isPlaying ? (
        <SearchSquareGame {...gameProps} />
      ) : (
        <SearchSquareInstructions {...instructionsProps} />
      )}
    </>
  );
};

export default SearchSquare;
