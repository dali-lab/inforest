import { useCallback, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Plot } from "@ong-forestry/schema";
import { MapScreenModes, MapScreenZoomLevels } from "../../constants";
import useAppDispatch from "../../hooks/useAppDispatch";
import { deselectTree } from "../../redux/slices/treeSlice";
import PlotView from "./PlotView";
import ForestView from "./ExploreView";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../App";

export default function MapScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "map">>();
  const dispatch = useAppDispatch();

  const [zoomLevel, setZoomLevel] = useState<MapScreenZoomLevels>(
    route.params.zoomLevel
  );
  const [mode, setMode] = useState<MapScreenModes>(route.params.mode);
  const switchMode = useCallback(() => {
    switch (mode) {
      case MapScreenModes.Explore:
        setMode(MapScreenModes.Plot);
        break;
      case MapScreenModes.Plot:
        setMode(MapScreenModes.Explore);
        break;
    }
  }, [mode]);

  const [selectedPlot, setSelectedPlot] = useState<Plot | undefined>(
    route.params.selectedPlot
  );

  const selectPlot = useCallback(
    (plot: Plot) => {
      setSelectedPlot(plot);
    },
    [setSelectedPlot]
  );

  const deselectPlot = useCallback(() => {
    setSelectedPlot(undefined);
  }, [setSelectedPlot]);

  const beginPlotting = useCallback(
    (plot) => {
      setZoomLevel(MapScreenZoomLevels.Plot);
      setSelectedPlot(plot);
    },
    [setSelectedPlot, setZoomLevel]
  );

  const endPlotting = useCallback(() => {
    dispatch(deselectTree());
    setZoomLevel(MapScreenZoomLevels.Forest);
  }, [dispatch, setZoomLevel]);

  return (
    <View style={styles.container}>
      {zoomLevel === "FOREST" && (
        <ForestView
          mode={mode}
          switchMode={switchMode}
          selectedPlot={selectedPlot}
          selectPlot={selectPlot}
          deselectPlot={deselectPlot}
          beginPlotting={beginPlotting}
        />
      )}
      {zoomLevel === "PLOT" && selectedPlot && (
        <PlotView
          mode={mode}
          switchMode={switchMode}
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
