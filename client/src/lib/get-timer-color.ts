import { BoardOrientation } from "react-chessboard/dist/chessboard/types";

/**
 *
 * @param {number} color The player color of this particular timer
 * @param {number} activeColor The active color of the chess game
 * @param {number} isTimedGame Whether the game has time controls
 * @return {String} Class name providing the correct styling for the timer box
 */
export const getTimerColor = (
  color: BoardOrientation,
  activeColor: BoardOrientation,
  isTimedGame: boolean
) => {
  // Untimed and white
  if (!isTimedGame && color === "white") {
    return "text-black/50 bg-white/50";
  }

  // Untimed and black
  if (!isTimedGame && color === "black") {
    return "text-white/50 bg-black/50";
  }

  // White and active
  if (color === "white" && activeColor === "white") {
    return "text-black/100 bg-white/100";
  }

  // White and inactive
  if (color === "white" && activeColor !== "white") {
    return "text-black/50 bg-white/50";
  }
  // Black and active
  if (color === "black" && activeColor === "black") {
    return "text-white/100 bg-black/100";
  }

  // Black and inactive
  if (color === "black" && activeColor !== "black") {
    return "text-white/50 bg-black/50";
  }
};
