"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import StockfishWorkerManager from "@/lib/stockfish/stockfish-worker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings } from "lucide-react";

interface GameOptionsProps {
  blackBot: StockfishWorkerManager | null;
  whiteBot: StockfishWorkerManager | null;
  setIsPlaying: (isPlaying: boolean) => void;
  handleReset: () => void;
  isPlaying: boolean;
}

export default function GameOptions({
  blackBot,
  whiteBot,
  setIsPlaying,
  handleReset,
  isPlaying,
}: GameOptionsProps) {
  const formSchema = z.object({
    whiteDepthOrTime: z.enum(["depth", "time"]),
    whiteSkillLevel: z
      .number()
      .int({ message: "Skill level must be a whole number" })
      .min(1, { message: "Skill level cannot be lower than 1" })
      .max(20, { message: "Skill level cannot be higher than 20" }),
    whiteTime: z
      .number()
      .int({ message: "Time must be a whole number" })
      .min(1, { message: "Time cannot be lower than 1" })
      .max(60, { message: "Time cannot be higher than 60" }),
    whiteDepth: z
      .number()
      .int({ message: "Depth must be a whole number" })
      .min(1, { message: "Depth cannot be lower than 1" })
      .max(30, { message: "Depth cannot be higher than 30" }),
    blackDepthOrTime: z.enum(["depth", "time"]),
    blackSkillLevel: z
      .number()
      .int({ message: "Skill level must be a whole number" })
      .min(1, { message: "Skill level cannot be lower than 1" })
      .max(20, { message: "Skill level cannot be higher than 20" }),
    blackTime: z
      .number()
      .int({ message: "Time must be a whole number" })
      .min(1, { message: "Time cannot be lower than 1" })
      .max(60, { message: "Time cannot be higher than 60" }),
    blackDepth: z
      .number()
      .int({ message: "Depth must be a whole number" })
      .min(1, { message: "Depth cannot be lower than 1" })
      .max(30, { message: "Depth cannot be higher than 30" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      whiteDepthOrTime: "time",
      whiteSkillLevel: 20,
      whiteTime: 5,
      whiteDepth: 20,
      blackDepthOrTime: "time",
      blackSkillLevel: 20,
      blackTime: 5,
      blackDepth: 20,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("submitted");
    console.log("values:", values);
  }

  const PlayerSettings = ({ color }: { color: "white" | "black" }) => {
    const prefix = color === "white" ? "white" : "black";

    return (
      <div className="space-y-4">
        <FormField
          control={form.control}
          name={`${prefix}DepthOrTime` as const}
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Search by...</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="time" />
                    </FormControl>
                    <FormLabel className="font-normal">Time</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="depth" />
                    </FormControl>
                    <FormLabel className="font-normal">Move Depth</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name={`${prefix}Time` as const}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time (seconds)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={form.watch(`${prefix}DepthOrTime`) === "depth"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`${prefix}Depth` as const}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Depth</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={form.watch(`${prefix}DepthOrTime`) === "time"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-2 justify-between w-[50%]"
      >
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="">
                White
                <Settings className="h-4 w-4 rotate-0 scale-100 transition-all" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">White Settings</h4>
                  <PlayerSettings color="white" />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="">
                Black{" "}
                <Settings className="h-4 w-4 rotate-0 scale-100 transition-all" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Black Settings</h4>
                  <PlayerSettings color="black" />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex gap-2">
          <Button type="submit">{isPlaying ? "Pause" : "Play"}</Button>
          <Button onClick={handleReset} type="button">
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}
