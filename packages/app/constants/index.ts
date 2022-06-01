import { PlotCensus, PlotCensusStatuses, Tree } from "@ong-forestry/schema";

export enum MapScreenModes {
  Explore = "EXPLORE",
  Plot = "PLOT",
}

export enum MapScreenZoomLevels {
  Forest = "FOREST",
  Plot = "PLOT",
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

export const convertToNaturalLanguage = (
  value?: PlotCensusStatuses,
  casing: "ALL_LOWER" | "ALL_UPPER" | "NORMAL" = "NORMAL"
) => {
  let result = "";
  switch (value) {
    case PlotCensusStatuses.InProgress:
      result = "In Progress";
      break;
    case PlotCensusStatuses.Pending:
      result = "Pending";
      break;
    case PlotCensusStatuses.Approved:
      result = "Approved";
      break;
  }
  switch (casing) {
    case "ALL_LOWER":
      return result.toLowerCase();
    case "ALL_UPPER":
      return result.toUpperCase();
  }
  return result;
};

export const BLUR_VIEW_INTENSITY = 40;
