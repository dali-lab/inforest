import { Tree } from "@ong-forestry/schema";

export enum MapScreenModes {
  Explore = "EXPLORE",
  Plot = "PLOT",
  Select = "SELECT"
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