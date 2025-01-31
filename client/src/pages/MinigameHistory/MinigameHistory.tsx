import { useEffect, useState } from "react";
import { columns, MinigameStat } from "./Columns";
import { DataTable } from "./DataTable";
import customAxios from "@/api/custom-axios";

const MinigameHistory = () => {
  const [minigameData, setMinigameData] = useState<MinigameStat[]>([]);

  async function getData(): Promise<void> {
    const res = await customAxios.get("/minigame-stats");
    setMinigameData(res.data);
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="flex flex-col items-center container mx-auto px-4 py-2 max-w-3xl">
      <DataTable columns={columns} data={minigameData} />
    </div>
  );
};

export default MinigameHistory;
