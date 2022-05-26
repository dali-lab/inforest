import { useCallback, useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Plot } from "@ong-forestry/schema";
import { MapScreenModes, MapScreenZoomLevels } from "../../constants";
import useAppDispatch from "../../hooks/useAppDispatch";
import { getForest } from "../../redux/slices/forestSlice";
import { getForestPlots } from "../../redux/slices/plotSlice";
import { deselectTree, getForestTrees } from "../../redux/slices/treeSlice";
import { FOREST_ID } from "../../constants/dev";
import { getAllTreeSpecies } from "../../redux/slices/treeSpeciesSlice";
import { getAllTreeLabels } from "../../redux/slices/treeLabelSlice";
import PlotView from "./PlotView";
import ForestView from "./ExploreView";
import { getAllTreePhotoPurposes } from "../../redux/slices/treePhotoPurposeSlice";
import { getForestForestCensuses } from "../../redux/slices/forestCensusSlice";

export default function MapScreen() {
  const dispatch = useAppDispatch();

  const [zoomLevel, setZoomLevel] = useState<MapScreenZoomLevels>(
    MapScreenZoomLevels.Forest
  );
  const [mode, setMode] = useState<MapScreenModes>(MapScreenModes.Explore);

  const [selectedPlot, setSelectedPlot] = useState<Plot>();

  const selectPlot = useCallback(
    (plot: Plot) => {
      setSelectedPlot(plot);
    },
    [setSelectedPlot]
  );

  const deselectPlot = useCallback(() => {
    setSelectedPlot(undefined);
  }, [setSelectedPlot]);

  const beginPlotting = useCallback(() => {
    setZoomLevel(MapScreenZoomLevels.Plot);
  }, [setZoomLevel]);

  const endPlotting = useCallback(() => {
    dispatch(deselectTree());
    setZoomLevel(MapScreenZoomLevels.Forest);
  }, [dispatch, setZoomLevel]);

  return (
    <View style={styles.container}>
      {zoomLevel === "FOREST" && (
        <ForestView
          // selectedForestCensus={}
          mode={mode}
          switchMode={() => {
            switch (mode) {
              case MapScreenModes.Explore:
                setMode(MapScreenModes.Plot);
                break;
              case MapScreenModes.Plot:
                setMode(MapScreenModes.Explore);
                break;
            }
          }}
          selectedPlot={selectedPlot}
          selectPlot={selectPlot}
          deselectPlot={deselectPlot}
          beginPlotting={beginPlotting}
        />
      )}
      {zoomLevel === "PLOT" && selectedPlot && (
        <PlotView
          mode={mode}
          selectedPlot={selectedPlot}
          onExit={endPlotting}
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
