import { subsetScramble } from "@/app/lib/subsetScramble";
import { PuzzleType } from "./types";
import { generateScramble } from "react-rubiks-cube-utils";

export const createSubsetScramble = (type: PuzzleType): string => {
  return subsetScramble({ type });
};

export const createScramble = (type: PuzzleType): string => {
  return generateScramble({ type });
};
