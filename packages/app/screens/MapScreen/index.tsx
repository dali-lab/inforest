import { useCallback, useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Plot } from "@ong-forestry/schema";
import { MapScreenModes } from "../../constants";
import useAppDispatch from "../../hooks/useAppDispatch";
import { getForest } from "../../redux/slices/forestSlice";
import { getForestPlots } from "../../redux/slices/plotSlice";
import { deselectTree, getForestTrees } from "../../redux/slices/treeSlice";
import { FOREST_ID } from "../../constants/dev";
import { getAllTreeSpecies } from "../../redux/slices/treeSpeciesSlice";
import { getAllTreeLabels } from "../../redux/slices/treeLabelSlice";
import PlotView from "./PlotView";
import ExploreView from "./ExploreView";
import { getAllTreePhotoPurposes } from "../../redux/slices/treePhotoPurposeSlice";
import { getForestForestCensuses } from "../../redux/slices/forestCensusSlice";

export default function MapScreen() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getForest({ id: FOREST_ID }));
    dispatch(getForestPlots({ forestId: FOREST_ID }));
    dispatch(
      getForestTrees({
        forestId: FOREST_ID,
      })
    );
    dispatch(getAllTreeSpecies());
    dispatch(getAllTreeLabels());
    dispatch(getAllTreePhotoPurposes());
    dispatch(getForestForestCensuses({ forestId: FOREST_ID }));
  }, [dispatch]);

  const [mode, setMode] = useState<MapScreenModes>(MapScreenModes.Explore);

  const [selectedPlot, setSelectedPlot] = useState<Plot>();

  const selectPlot = useCallback(
    (plot: Plot) => {
      setSelectedPlot(plot);
      setMode(MapScreenModes.Select);
    },
    [setSelectedPlot, setMode]
  );

  const deselectPlot = useCallback(() => {
    setSelectedPlot(undefined);
    setMode(MapScreenModes.Explore);
  }, [setSelectedPlot, setMode]);

  const beginPlotting = useCallback(() => {
    setMode(MapScreenModes.Plot);
  }, [setMode]);

  const endPlotting = useCallback(() => {
    dispatch(deselectTree());
    setMode(MapScreenModes.Select);
  }, [setMode, dispatch]);

  return (
    <View style={styles.container}>
      {mode !== "PLOT" && (
        <ExploreView
          // selectedForestCensus={}
          selectedPlot={selectedPlot}
          selectPlot={selectPlot}
          deselectPlot={deselectPlot}
          beginPlotting={beginPlotting}
        />
      )}
      {mode === "PLOT" && selectedPlot && (
        <PlotView
          selectedPlot={selectedPlot}
          onExit={() => {
            setMode(MapScreenModes.Explore);
            endPlotting();
          }}
          endPlotting={endPlotting}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
