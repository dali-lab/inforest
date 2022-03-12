import { Tree } from "@ong-forestry/schema";

export enum MapScreenModes {
  Explore = "EXPLORE",
  Plot = "PLOT",
  Select = "SELECT",
}

export const DEFAULT_DBH = 30;
export const FOLIAGE_MAGNIFICATION = 3;

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

export type VisualizationConfigType = {
  modalOpen: boolean;
  colorBySpecies: boolean;
  numOfSpecies: number;
  satellite: boolean;
};
