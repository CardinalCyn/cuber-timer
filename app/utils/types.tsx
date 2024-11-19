import { puzzleTypeMap } from "./constants";

export type PuzzleType = keyof typeof puzzleTypeMap;

export type C2F2LLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type SubsetScrambleType = "twogen" | "twogenl";
