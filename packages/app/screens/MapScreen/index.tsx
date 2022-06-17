import React, { useCallback, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, View } from "react-native";
import { MapScreenModes, MapScreenZoomLevels } from "../../constants";

import useAppDispatch from "../../hooks/useAppDispatch";
import { selectPlot } from "../../redux/slices/plotSlice";
import { deselectTree } from "../../redux/slices/treeSlice";
import PlotView from "./PlotView";
import ForestView from "./ExploreView";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import useAppSelector from "../../hooks/useAppSelector";
import { deselectTreeCensus } from "../../redux/slices/treeCensusSlice";
import Colors from "../../constants/Colors";
import { selectPlotCensus } from "../../redux/slices/plotCensusSlice";
import { useIsConnected } from "react-native-offline";
import { Text, TextVariants } from "../../components/Themed";

export default function MapScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "map">>();
  const dispatch = useAppDispatch();

  const isConnected = useIsConnected();

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

  const { loadingTasks } = useAppSelector((state) => state.sync);

  const { all, selected: selectedPlotId } = useAppSelector(
    (state) => state.plots
  );
  const {
    indices: { byPlotActive },
  } = useAppSelector((state) => state.plotCensuses);
  const selectedPlot = selectedPlotId ? all[selectedPlotId] : undefined;

  const beginPlotting = useCallback(
    (plot) => {
      setZoomLevel(MapScreenZoomLevels.Plot);
      dispatch(selectPlot(plot.id));
      if (plot.id in byPlotActive) {
        dispatch(selectPlotCensus(byPlotActive[plot.id]));
      }
    },
    [setZoomLevel, dispatch, byPlotActive]
  );

  const endPlotting = useCallback(() => {
    dispatch(deselectTree());
    dispatch(deselectTreeCensus());
    setZoomLevel(MapScreenZoomLevels.Forest);
  }, [dispatch, setZoomLevel]);
  return (
    <>
      {loadingTasks.size > 0 && (
        <View style={styles.loadingOverlay}>
          <Text variant={TextVariants.H3} color="white">
            {loadingTasks.keys().next().value}
          </Text>
          <ActivityIndicator
            style={{ marginTop: 16 }}
            size="large"
            color="white"
          />
        </View>
      )}
      {!isConnected && (
        <View style={styles.offlineBar}>
          <Text style={styles.offlineText}>
            You are currently offline. Your changes will be saved once you
            reconnect.
          </Text>
        </View>
      )}
      <View style={styles.container}>
        {zoomLevel === "FOREST" && (
          <ForestView
            mode={mode}
            switchMode={switchMode}
            beginPlotting={beginPlotting}
          />
        )}
        {zoomLevel === "PLOT" && selectedPlot && (
          <PlotView mode={mode} switchMode={switchMode} onExit={endPlotting} />
        )}
      </View>
    </>
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
  offlineBar: {
    backgroundColor: Colors.error,
    height: 24,
    width: "100%",
    top: 0,
    position: "absolute",
    zIndex: 1,
  },
  offlineText: {
    width: "100%",
    textAlign: "center",
    fontSize: 12,
    marginTop: 2,
    color: "white",
    position: "absolute",
  },
  loadingOverlay: {
    position: "absolute",
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.4)",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
});
