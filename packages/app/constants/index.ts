import { Tree } from "@ong-forestry/schema";

export const DEFAULT_DBH = 10;
export const FOLIAGE_MAGNIFICATION = 3;

export enum MapScreenModes {
  Explore = "EXPLORE",
  Plot = "PLOT",
}

export enum DrawerStates {
  Expanded = "EXPANDED",
  Closed = "CLOSED",
  Minimized = "MINIMIZED",
}

export type DraftTreesState = Record<string, Tree>;
export type DraftTreesAction =
  | {
      type: "ADD_TREE";
      payload: {
        tree: Tree;
      };
    }
  | {
      type: "REMOVE_TREE";
      payload: {
        id: string;
      };
    };
