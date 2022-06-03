import { useCallback, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Plot } from "@ong-forestry/schema";
import { MapScreenModes, MapScreenZoomLevels } from "../../constants";

import { PermissionStatus } from "expo-modules-core";
import useAppDispatch from "../../hooks/useAppDispatch";
import { selectPlot, deselectPlot } from "../../redux/slices/plotSlice";
import { deselectTree } from "../../redux/slices/treeSlice";
import PlotView from "./PlotView";
import ForestView from "./ExploreView";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import ExploreView from "./ExploreView";
import { getAllTreePhotoPurposes } from "../../redux/slices/treePhotoPurposeSlice";
import { getForestForestCensuses } from "../../redux/slices/forestCensusSlice";
import useAppSelector from "../../hooks/useAppSelector";
import { deselectTreeCensus } from "../../redux/slices/treeCensusSlice";
import { uploadCensusData } from "../../redux/slices/syncSlice";
import Colors from "../../constants/Colors";
import { Text } from "../../components/Themed";
import { selectPlotCensus } from "../../redux/slices/plotCensusSlice";

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
    [selectPlot, setZoomLevel, dispatch]
  );

  const endPlotting = useCallback(() => {
    dispatch(deselectTree());
    dispatch(deselectTreeCensus());
    setZoomLevel(MapScreenZoomLevels.Forest);
  }, [dispatch, setZoomLevel]);

  return (
    <>
      {/* {!isConnected && (
        <View style={styles.offlineBar}>
          <Text style={styles.offlineText}>
            You are currently offline. Your changes will be saved once you
            reconnect.
          </Text>
        </View>
      )} */}
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
  },
  offlineText: {
    width: "100%",
    textAlign: "center",
    fontSize: 12,
    marginTop: 2,
    color: "white",
    position: "absolute",
  },
});
