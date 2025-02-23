import { expect, test, describe } from "vitest";
import { getTimerColor } from "../lib/get-timer-color";

describe("getTimerColor", () => {
  test("returns correct class for untimed white player", () => {
    expect(getTimerColor("white", "black", false)).toBe(
      "text-black/50 bg-white/50"
    );
  });

  test("returns correct class for untimed black player", () => {
    expect(getTimerColor("black", "white", false)).toBe(
      "text-white/50 bg-black/50"
    );
  });

  test("returns correct class for active white player", () => {
    expect(getTimerColor("white", "white", true)).toBe(
      "text-black/100 bg-white/100"
    );
  });

  test("returns correct class for inactive white player", () => {
    expect(getTimerColor("white", "black", true)).toBe(
      "text-black/50 bg-white/50"
    );
  });

  test("returns correct class for active black player", () => {
    expect(getTimerColor("black", "black", true)).toBe(
      "text-white/100 bg-black/100"
    );
  });

  test("returns correct class for inactive black player", () => {
    expect(getTimerColor("black", "white", true)).toBe(
      "text-white/50 bg-black/50"
    );
  });
});
