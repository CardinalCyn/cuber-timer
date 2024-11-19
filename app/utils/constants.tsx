import { IoniconName } from "./iconiconNames";

export const allScreens: {
  name: string;
  drawerLabel: string;
  ioniconName: IoniconName;
}[] = [
  {
    name: "index",
    drawerLabel: "Timer",
    ioniconName: "timer",
  },
  {
    name: "settings",
    drawerLabel: "Settings",
    ioniconName: "settings",
  },
  {
    name: "practice",
    drawerLabel: "Practice",
    ioniconName: "pencil",
  },
];

export const puzzleTypeMap = {
  "2x2": "2x2 Cube",
  "3x3": "3x3 Cube",
  "4x4": "4x4 Cube",
  "5x5": "5x5 Cube",
  "6x6": "6x6 Cube",
  "7x7": "7x7 Cube",
  "square-1": "Square",
  pyraminx: "Pyraminx",
  clock: "Clock",
  skewb: "Skewb",
  megaminx: "Megaminx",
};
