import { Chess } from "chess.js";

export type UninitialisedBot = () => InitialisedBot;
export type InitialisedBot = (fen: string) => Promise<any>;
export type AvailableBots = Record<string, UninitialisedBot>;

const randomMove: UninitialisedBot = () => (fen) =>
  new Promise((resolve) => {
    const moves = new Chess(fen).moves({ verbose: true });
    const { from, to } = moves[Math.floor(Math.random() * moves.length)];
    setTimeout(() => resolve({ from, to }), 500);
  });

const uciWorker = (file: string, actions: Array<string>): UninitialisedBot => {
  return () => {
    console.log(file);
    const worker = new Worker(file);
    let resolver: ((move: any) => void) | null = null;

    worker.addEventListener("message", (e) => {
      const move = e.data.match(/^bestmove\s([a-h][1-8])([a-h][1-8])/);
      if (move && resolver) {
        resolver({ from: move[1], to: move[2] });
        resolver = null;
      }
    });

    return async (fen) =>
      new Promise((resolve, reject) => {
        if (resolver) {
          reject("Pending move is present");
          return;
        }
        resolver = resolve;
        worker.postMessage(`position fen ${fen}`);
        actions.forEach((action) => worker.postMessage(action));
      });
  };
};

const Bots: AvailableBots = {
  Random: randomMove,
  "nmrugg/stockfish (l:1, d:10)": uciWorker("/stockfish-16.1.js", [
    "setoption name Skill Level value 1",
    "go depth 10",
  ]),
  "nmrugg/stockfish (l:20, d:16)": uciWorker("/stockfish-16.1.js", [
    "setoption name Skill Level value 20",
    "go depth 16",
  ]),
  "nmrugg/stockfish (l:20, t:5s)": uciWorker("/stockfish-16.1.js", [
    "setoption name Skill Level value 20",
    "go movetime 1000",
  ]),
};

export default Bots;
