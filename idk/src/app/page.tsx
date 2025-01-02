"use client";

import ChessboardWrapper from "@/components/chessboard-wrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_POSITION } from "chess.js";
import { Pen, Bot, Landmark } from "lucide-react";
import { Suspense } from "react";
import { Chessboard } from "react-chessboard";

const Home = () => {
  return (
    <div className="flex flex-wrap md:flex-nowrap h-full w-full justify-center items-center gap-10 py-5 px-10">
      <div className="flex flex-col gap-6">
        <h1 className="text-5xl leading-normal text-center flex flex-wrap justify-center font-bold">
          <span className="whitespace-nowrap">Practice All</span>
          &nbsp;
          <span className="whitespace-nowrap">Aspects</span>
          &nbsp;
          <span className="whitespace-nowrap">of Chess!</span>
        </h1>
        <div className="flex flex-col items-center gap-5 justify-around h-full">
          <Button className="min-w-80 max-w-[30rem] w-80 md:w-full h-28">
            <Pen className="w-12 h-12" strokeWidth={3} />
            <div className="w-full h-full flex flex-between gap-2 items-center">
              <div className="flex-1">
                <h2>Chess Coordinates</h2>
                <p className="text-wrap line-clamp-2">
                  Recognize chess coordinates instantly! Test Test Test Test
                  Test Test Test Test Test Test Test Test Test Test Test Test
                  Test
                </p>
              </div>
            </div>
          </Button>
          <Button
            variant={"secondary"}
            className="min-w-80 max-w-[30rem] md:w-full h-28"
          >
            Bye
          </Button>
        </div>
      </div>
      <ChessboardWrapper>
        <Suspense fallback={<Skeleton className="w-[500px] h-[500px]" />}>
          <Chessboard
            customBoardStyle={{ width: "100%" }}
            position={DEFAULT_POSITION}
            arePiecesDraggable={false}
          />
        </Suspense>
      </ChessboardWrapper>
    </div>
  );
};

export default Home;
