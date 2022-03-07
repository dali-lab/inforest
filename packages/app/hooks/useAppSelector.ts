import { Plot, Tree } from "@ong-forestry/schema";
import { Region } from "react-native-maps";
import { TypedUseSelectorHook, useSelector } from "react-redux";
import type { RootState } from "../redux";
import { createDraftSafeSelector as createSelector } from "@reduxjs/toolkit";
import { getPlotCorners } from "../constants/plots";

//This hook allows for the selector hook to use typescript types
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

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

export const useTreesInPlots = createSelector(
  [(trees: Tree[]) => trees, (_: Tree[], plots: Set<string>) => plots],
  (trees: Tree[], plots: Set<string>) => {
    return trees.filter((tree) => plots.has(tree.plotNumber));
  }
);

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

export const usePlots = createSelector(
  (state: RootState) => state.plots,
  (plots) => Object.values(plots.all)
);

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
