import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export type MinigameStat = {
  id: number;
  createdAt: Date;
  game: string;
  score: number;
  correct: number;
  incorrect: number;
  total: number;
  accuracy: number;
};

export const columns: ColumnDef<MinigameStat>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2">
          Date
          <Button
            variant="ghost"
            className="px-2 py-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
      return <div className="text-left font-medium">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "game",
    header: () => <div className="text-left">Game</div>,
    filterFn: (row, id, value) => {
      if (value === "") return true;
      return row.getValue(id) === value;
    },
    cell: ({ row }) => {
      const game = row.getValue("game") as string;
      let formattedGame: string = game;
      let bgColor = "bg-purple-600";

      switch (game) {
        case "MAKEMOVE":
          formattedGame = "Make Move";
          bgColor = "bg-orange-600";
          break;
        case "NAMENOTATION":
          formattedGame = "Name Notation";
          bgColor = "bg-green-600";
          break;
        case "SEARCHSQUARE":
          formattedGame = "Search Square";
          bgColor = "bg-blue-600";
          break;
        default:
          break;
      }

      return (
        <div className="py-1 flex justify-start">
          <div
            className={`${bgColor} w-fit rounded px-1 py-1 text-xs font-medium`}
          >
            {formattedGame}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "score",
    header: () => <div className="text-right">Score</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("score")}</div>;
    },
  },
  {
    accessorKey: "correct",
    accessorFn: (row) => row.score + row.total / 2,
    header: () => <span>Correct</span>,
    cell: ({ row }) => {
      const score = row.getValue("score") as number;
      const total = row.getValue("total") as number;
      return <div className="text-center">{(score + total) / 2}</div>;
    },
  },
  {
    accessorKey: "incorrect",
    accessorFn: (row) => row.score + row.total / 2,
    header: () => <span>Incorrect</span>,
    cell: ({ row }) => {
      const score = row.getValue("score") as number;
      const total = row.getValue("total") as number;
      return <div className="text-center">{(total - score) / 2}</div>;
    },
  },
  {
    accessorKey: "total",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("total")}</div>;
    },
  },
  {
    accessorKey: "accuracy",
    accessorFn: (row) => (row.total ? row.score / row.total : 0),
    header: () => <span>Accuracy</span>,
    cell: ({ row }) => {
      const score = row.getValue("score") as number;
      const total = row.getValue("total") as number;
      const accuracy = total ? score / total : 0; // Prevent division by zero
      return <div className="text-right">{(accuracy * 100).toFixed(2)}%</div>; // Convert to percentage
    },
  },
];
