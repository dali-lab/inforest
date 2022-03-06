import { Tree } from "@ong-forestry/schema";
import { Region } from "react-native-maps";
import { TypedUseSelectorHook, useSelector } from "react-redux";
import { sortedIndex, pick, intersection, create } from "lodash";
import type { RootState } from "../redux";
import { createSelector } from "reselect";

//This hook allows for the selector hook to use typescript types
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

type TreesSelectorParams = {
  /** Scalar from 0.0 - 1.0 controlling density of trees which are chosen at random. */
  density?: number;
  /** Only fetch trees from these plots. */
  plotNumbers?: Set<string>;
};
export const useTrees = createSelector(
  [
    (state: RootState) => state.trees,
    (_: RootState, params: TreesSelectorParams) => params,
  ],
  (trees: RootState["trees"], params: TreesSelectorParams) => {
    const { density = 1.0, plotNumbers } = params;
    const { all } = trees;
    const treesAsList = Object.values(all);
    let treesToReturn = [];
    for (let i = 0; i < treesAsList.length; i += Math.floor(1 / density)) {
      const tree = treesAsList[i];
      if ((!!plotNumbers && plotNumbers.has(tree.plotNumber)) || !plotNumbers) {
        treesToReturn.push(treesAsList[i]);
      }
    }
    return treesToReturn;
  }
);

export const useMoreTrees = createSelector(
  [useTrees, (_, plotNumbers: string[]) => plotNumbers],
  (foo, plotNumbers) => {}
);

type PlotsSelectorParams = {
  viewingBox?: Region;
};

export const usePlots = ({ viewingBox }: PlotsSelectorParams) =>
  useAppSelector(({ plots }) => {
    const {
      all,
      indices: { latitude, longitude },
    } = plots;
    let plotsToReturn = all;

    if (!!viewingBox) {
      const latValues = latitude.map(({ value }) => value);
      const longValues = longitude.map(({ value }) => value);

      const latStart = sortedIndex(
        latValues,
        viewingBox.latitude - viewingBox.latitudeDelta
      );
      const latEnd = sortedIndex(
        latValues,
        viewingBox.latitude + viewingBox.latitudeDelta
      );
      const lonStart = sortedIndex(
        longValues,
        viewingBox.longitude - viewingBox.longitudeDelta
      );
      const lonEnd = sortedIndex(
        longValues,
        viewingBox.longitude + viewingBox.longitudeDelta
      );
      const containedPlots = intersection(
        latitude
          .slice(latStart, latEnd + 1)
          .map(({ plotNumber }) => plotNumber),
        longitude
          .slice(lonStart, lonEnd + 1)
          .map(({ plotNumber }) => plotNumber)
      );
      plotsToReturn = pick(plotsToReturn, containedPlots);
    }
    return plotsToReturn;
  });

export default useAppSelector;
