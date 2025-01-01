class StockfishWorkerManager {
  private worker: Worker;
  private resolver: ((move: { from: string; to: string }) => void) | null =
    null;
  private depthOrTime: string = "depth";
  private value: number = 0;

  constructor() {
    this.worker = new Worker("/stockfish-16.1.js");
    this.worker.addEventListener(
      "message",
      this.handleWorkerMessage.bind(this)
    );
  }

  private handleWorkerMessage(event: MessageEvent): void {
    const move = event.data.match(/^bestmove\s([a-h][1-8])([a-h][1-8])/);
    if (move && this.resolver) {
      this.resolver({ from: move[1], to: move[2] });
      this.resolver = null;
    }
  }

  /**
   *
   * @param skillLevel - The skill level of stockfish on a scale of 1 - 20 (1 being easiest, 20 being hardest)
   * @param useDepth - Determines if stockfish uses depth or time to find moves
   * @param depthOrTimeValue - The number of half-moves to look through per move if useDepth is true, or the number of seconds to use to look through moves if useDepth is false
   */
  public config(
    skillLevel: number,
    useDepth: boolean,
    depthOrTimeValue: number
  ) {
    this.depthOrTime = useDepth ? "depth" : "movetime";
    this.value = depthOrTimeValue;
    this.worker.postMessage(`setoption name Skill Level value ${skillLevel}`);
  }

  public async makeMove(fen: string): Promise<{ from: string; to: string }> {
    return new Promise((resolve, reject) => {
      if (this.resolver) {
        reject("Pending move is present");
        return;
      }

      this.resolver = resolve;
      this.worker.postMessage(`position fen ${fen}`);
      this.worker.postMessage(`go ${this.depthOrTime} ${this.value}`);
    });
  }

  public reset(): void {
    console.log("resetting eval bot");
    this.worker.terminate();
    this.worker = new Worker("/stockfish-16.1.js");
  }

  public terminate(): void {
    this.worker.terminate();
  }
}

export default StockfishWorkerManager;
