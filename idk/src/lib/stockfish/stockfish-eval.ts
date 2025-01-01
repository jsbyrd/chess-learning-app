export type EvaluationUpdate = {
  evaluation: number;
  depth: number;
};

export class StockfishEvaluator {
  private worker: Worker;
  private isSearching: boolean = false;
  private onUpdate: (update: EvaluationUpdate) => void;

  constructor(onEvaluationUpdate: (update: EvaluationUpdate) => void) {
    this.onUpdate = onEvaluationUpdate;
    this.worker = this.createWorker();
  }

  private createWorker(): Worker {
    const worker = new Worker("/stockfish-16.1.js");

    // Initialize engine settings
    worker.postMessage("setoption name Skill Level value 20");
    worker.postMessage("setoption name MultiPV value 1");
    worker.postMessage("setoption name Hash value 64");

    // Attach message handler to worker
    worker.addEventListener("message", this.handleWorkerMessage.bind(this));

    return worker;
  }

  private handleWorkerMessage(event: MessageEvent): void {
    // Look for info depth messages which contain evaluation
    const infoMatch = event.data.match(
      /info depth (\d+) .*score (cp|mate) (-?\d+)/
    );

    if (infoMatch) {
      const depth = parseInt(infoMatch[1]);
      const type = infoMatch[2];
      const value = parseInt(infoMatch[3]);

      let evaluation: number;
      if (type === "cp") {
        evaluation = value;
      } else {
        // Convert mate score to centipawns
        evaluation = value > 0 ? 20000 - value : -20000 - value;
      }

      this.onUpdate({ evaluation, depth });
    }
  }

  public startAnalysis(fen: string): void {
    // If already analyzing, stop the current analysis
    if (this.isSearching) {
      this.worker.postMessage("stop");
    }

    this.isSearching = true;

    // Clear search hash before new position
    this.worker.postMessage("setoption name Clear Hash");

    // Start analysis of new position
    this.worker.postMessage(`position fen ${fen}`);
    this.worker.postMessage("go nodes 100000");
  }

  public reset(): void {
    console.log("Resetting eval bot");
    this.isSearching = false;
    this.worker.terminate();
    this.worker = this.createWorker();
  }

  public terminate(): void {
    if (this.isSearching) {
      this.worker.postMessage("stop");
    }
    this.worker.terminate();
  }
}
