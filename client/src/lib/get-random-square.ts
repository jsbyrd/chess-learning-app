const chessFiles = ["a", "b", "c", "d", "e", "f", "g", "h"];
const chessRanks = ["1", "2", "3", "4", "5", "6", "7", "8"];
const NUM_SQUARES = 64;
const SIDE_LENGTH = 8;

export default function getRandomSquare(
  previousCoord: string | undefined
): string {
  let randNum = Math.floor(Math.random() * NUM_SQUARES);
  let randFile = chessFiles[Math.floor(randNum / SIDE_LENGTH)];
  let randRank = chessRanks[randNum % SIDE_LENGTH];

  // Avoids returning same coord as previous coord
  if (previousCoord && randFile + randRank === previousCoord) {
    const newRandNum = Math.floor(Math.random() * (NUM_SQUARES - 1));
    randNum = (randNum + newRandNum) % NUM_SQUARES;
    randFile = chessFiles[Math.floor(randNum / SIDE_LENGTH)];
    randRank = chessRanks[randNum % SIDE_LENGTH];
  }

  return randFile + randRank;
}
