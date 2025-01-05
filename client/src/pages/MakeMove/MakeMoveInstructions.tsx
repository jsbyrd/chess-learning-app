import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChessColor, ChessColorStrict } from "@/lib/common-types";
import ChessboardWrapper from "@/components/ChessboardWrapper";
import { Chessboard } from "react-chessboard";
import { useMemo } from "react";

export interface MakeMoveInstructionsProps {
  setIsPlaying: (isPlaying: boolean) => void;
  setIsPractice: (isPractice: boolean) => void;
  selectedColor: ChessColor;
  setSelectedColor: (selectedColor: ChessColor) => void;
  showCoordinates: boolean;
  setShowCoordinates: (showCoordinates: boolean) => void;
}

const MakeMoveInstructions = (props: MakeMoveInstructionsProps) => {
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
    <div className="flex flex-col gap-10 items-center container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-center">Make That Move</h1>
        <p className="text-sm">
          Instructions: You will be given a random board position and a move to
          make in algebraic notation. Your goal is to make as many correct moves
          as possible in 60 seconds! Do note that the move is randomly selected
          from all possible moves in the position and may or may not be
          nonsensical.
        </p>
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
        <ChessboardWrapper className="pb-10">
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

export default MakeMoveInstructions;
