import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChessColor, ChessColorStrict } from "@/lib/common-types";
import ChessboardWrapper from "@/components/ChessboardWrapper";
import { Chessboard } from "react-chessboard";
import { useMemo } from "react";

export interface SearchSquareInstructionsProps {
  setIsPlaying: (isPlaying: boolean) => void;
  setIsPractice: (isPractice: boolean) => void;
  selectedColor: ChessColor;
  setSelectedColor: (selectedColor: ChessColor) => void;
  showCoordinates: boolean;
  setShowCoordinates: (showCoordinates: boolean) => void;
}

const SearchSquareInstructions = (props: SearchSquareInstructionsProps) => {
  const {
    setIsPlaying,
    setIsPractice,
    selectedColor,
    setSelectedColor,
    showCoordinates,
    setShowCoordinates,
  } = props;

  // const randomChessColor = useCallback((): ChessColorStrict => {
  //   return Math.random() < 0.5 ? "white" : "black";
  // }, [selectedColor]);

  const randomChessColor: ChessColorStrict = useMemo(() => {
    return Math.random() < 0.5 ? "white" : "black";
  }, [selectedColor]);

  const handleColorChange = (value: ChessColor) => {
    setSelectedColor(value);
  };

  const handleStartGame = () => {
    setIsPractice(false);
    setIsPlaying(true);
  };

  const handleStartPractice = () => {
    setIsPractice(true);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col gap-10 items-center mx-auto container px-12 py-8 max-w-5xl">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-center">Search That Square</h1>
        <div className="flex flex-col gap-3">
          <p className="text-md">
            <span className="font-bold">Instructions:</span> You will be given a
            random coordinate. Your goal is to click the square that corresponds
            to that coordinate. Get it right and you gain a point. Get it wrong
            and you lose a point. Click as many correct squares as possible in
            60 seconds!
          </p>
        </div>
      </div>

      <div className="flex justify-center items-center flex-wrap gap-10">
        <div className="flex flex-col gap-8">
          <h2 className="text-xl font-bold">Options</h2>
          <div className="flex flex-col justify-center items-start gap-4">
            <div className="flex justify-center items-start space-x-6">
              <RadioGroup
                defaultValue={selectedColor}
                onValueChange={handleColorChange}
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
            <div className="flex justify-center items-center gap-2">
              <Checkbox
                id="show-coordinates"
                checked={showCoordinates}
                onCheckedChange={(checked: boolean) =>
                  setShowCoordinates(checked as boolean)
                }
              />
              <Label htmlFor="show-coordinates">Show Coordinates</Label>
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            <Button onClick={handleStartGame}>Start</Button>
            <Button variant="outline" onClick={handleStartPractice}>
              Practice
            </Button>
          </div>
        </div>
        <ChessboardWrapper className="pb-10 md:pb-0">
          <Chessboard
            showBoardNotation={showCoordinates}
            boardOrientation={
              selectedColor !== "random" ? selectedColor : randomChessColor
            }
            arePiecesDraggable={false}
          />
        </ChessboardWrapper>
      </div>
    </div>
  );
};

export default SearchSquareInstructions;
