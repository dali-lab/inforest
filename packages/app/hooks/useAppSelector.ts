import { Plot, Tree } from "@ong-forestry/schema";
import { Region } from "react-native-maps";
import { TypedUseSelectorHook, useSelector } from "react-redux";
import { sortedIndex, pick, intersection, create } from "lodash";
import type { RootState } from "../redux";
import { createDraftSafeSelector as createSelector } from "@reduxjs/toolkit";
import { getPlotCorners } from "../constants/plots";

//This hook allows for the selector hook to use typescript types
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Selects trees from store at a designated density level.
 * @param {number} density Density factor from 0.0 - 1.0.
 * @returns {Tree[]} Array of trees at the specified density.
 */
export const useTreesByDensity = createSelector(
  [
    (state: RootState) => state.trees,
    (_: RootState, density?: number) => density,
  ],
  (trees: RootState["trees"], density: number = 1.0) => {
    const { all, drafts } = trees;
    const treeKeys = Object.keys(all);
    let selectedKeys = [];
    const draftsToAdd = new Set(drafts);
    for (let i = 0; i < treeKeys.length; i += Math.floor(1 / density)) {
      selectedKeys.push(treeKeys[i]);
      draftsToAdd.delete(treeKeys[i]);
    }
    draftsToAdd.forEach((draftTree) => selectedKeys.push(draftTree));
    return selectedKeys.map((key) => all[key]);
  }
);

/**
 * Selects only trees within designated plots.
 * @param {Set<Plot>} plots Set of plot numbers to filter by.
 * @returns {Tree[]} Array of trees within the specified plots.
 */
export const useTreesInPlots = createSelector(
  [(trees: Tree[]) => trees, (_: Tree[], plots: Set<string>) => plots],
  (trees: Tree[], plots: Set<string>) => {
    return trees.filter((tree) => plots.has(tree.plotNumber));
  }
);

/**
 * Selects only trees within a bounded geographical region.
 * @param {Region} region Region to filter by.
 * @returns {Tree[]} Array of trees within the specified region.
 */
export const useTreesInRegion = createSelector(
  [(trees: Tree[]) => trees, (_: Tree[], region?: Region) => region],
  (trees: Tree[], region?: Region) => {
    if (!region) {
      return trees;
    }
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
    return trees.filter((tree) => {
      if (!!tree.latitude && !!tree.longitude) {
        return (
          tree.latitude > latitude - latitudeDelta / 2 &&
          tree.latitude < latitude + latitudeDelta / 2 &&
          tree.longitude > longitude - longitudeDelta / 2 &&
          tree.longitude < longitude + longitudeDelta / 2
        );
      }
      return false;
    });
  }
);

/**
 * Selects plots from store and returns as an array.
 * @returns {Plot[]} Array of plots.
 */
export const usePlots = createSelector(
  (state: RootState) => state.plots,
  (plots) => Object.values(plots.all)
);

/**
 * Selects only plots within a bounded geographical region.
 * @param {Region} region Region to filter by.
 * @returns {Plot[]} Array of plots within the specified region.
 */
export const usePlotsInRegion = createSelector(
  [(plots: Plot[]) => plots, (_: Plot[], region?: Region) => region],
  (plots: Plot[], region?: Region) => {
    if (!region) {
      return plots;
    }
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
    return plots.filter((plot) => {
      const corners = getPlotCorners(plot);
      return corners.some(
        (corner) =>
          corner.latitude > latitude - latitudeDelta / 2 &&
          corner.latitude < latitude + latitudeDelta / 2 &&
          corner.longitude > longitude - longitudeDelta / 2 &&
          corner.longitude < longitude + longitudeDelta / 2
      );
    });
  }
);

// export const usePlots = ({ viewingBox }: PlotsSelectorParams) =>
//   useAppSelector(({ plots }) => {
//     const {
//       all,
//       indices: { latitude, longitude },
//     } = plots;
//     let plotsToReturn = all;

//     if (!!viewingBox) {
//       const latValues = latitude.map(({ value }) => value);
//       const longValues = longitude.map(({ value }) => value);

//       const latStart = sortedIndex(
//         latValues,
//         viewingBox.latitude - viewingBox.latitudeDelta / 2
//       );
//       const latEnd = sortedIndex(
//         latValues,
//         viewingBox.latitude + viewingBox.latitudeDelta / 2
//       );
//       const lonStart = sortedIndex(
//         longValues,
//         viewingBox.longitude - viewingBox.longitudeDelta / 2
//       );
//       const lonEnd = sortedIndex(
//         longValues,
//         viewingBox.longitude + viewingBox.longitudeDelta / 2
//       );
//       const containedPlots = intersection(
//         latitude
//           .slice(latStart, latEnd + 1)
//           .map(({ plotNumber }) => plotNumber),
//         longitude
//           .slice(lonStart, lonEnd + 1)
//           .map(({ plotNumber }) => plotNumber)
//       );
//       plotsToReturn = pick(plotsToReturn, containedPlots);
//     }
//     return plotsToReturn;
//   });

export default useAppSelector;
