import ChessboardWrapper from "@/components/ChessboardWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { chessboardWidth } from "@/lib/common-values";
import { isMobile } from "@/lib/is-mobile";
import { isValidPgnFormat } from "@/lib/is-valid-pgn-format";
import { Chess, DEFAULT_POSITION } from "chess.js";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { TouchBackend } from "react-dnd-touch-backend";

// TODO: Finish later (IN PROGRESS)

const Analysis = () => {
  const [game, setGame] = useState(new Chess());
  const [orientation, setOrientation] = useState<BoardOrientation>("white");
  const [position, setPosition] = useState<string | undefined>(undefined);
  const [pgnText, setPgnText] = useState("");
  const [isFileMode, setIsFileMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePgnTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPgnText(e.target.value);
    setIsFileMode(false);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      setPgnText(text);
      setIsFileMode(true);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error reading file");
    }
  };

  const clearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPgnText("");
    setIsFileMode(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidPgnFormat(pgnText)) {
      toast({
        title: "Error: Invalid PGN",
        description:
          "The text that you have entered is invalid. Please enter a valid PGN.",
        variant: "destructive",
      });
      return;
    }
    console.log(pgnText);
  };

  return (
    <div className="h-full flex justify-around items-center flex-wrap items-start px-4 py-8">
      {/* Chessboard */}
      <ChessboardWrapper className="flex justify-center">
        <Chessboard
          position={position ?? DEFAULT_POSITION}
          showBoardNotation={true}
          boardOrientation={orientation}
          customDndBackend={isMobile() ? TouchBackend : undefined}
        />
      </ChessboardWrapper>

      {/* Tools */}
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col justify-center gap-5 md:h-[80vh] rounded w-[350px]">
          {/* File Upload */}
          <div className="grid gap-2">
            <Label htmlFor="pgn-file">Upload PGN File</Label>
            <div className="flex">
              <input
                id="pgn-file"
                type="file"
                accept=".pgn"
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={!isFileMode && pgnText.length > 0}
                className="flex-1"
              />
              {isFileMode && (
                <button
                  type="button"
                  onClick={clearFile}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-[1px] bg-gray-500 flex-1" />
            <span className="text-gray-500 font-medium">OR</span>
            <div className="h-[1px] bg-gray-500 flex-1" />
          </div>

          {/* Text Input */}
          <div className="grid gap-2">
            <Label htmlFor="pgn-text">Paste PGN</Label>
            <Textarea
              id="pgn-text"
              value={pgnText}
              onChange={handlePgnTextChange}
              placeholder="Paste your PGN here..."
              disabled={isFileMode}
              className="min-h-[200px]"
            />
          </div>
          <Button type="submit">Evaluate Game</Button>
        </div>
      </form>
    </div>
  );
};

export default Analysis;
