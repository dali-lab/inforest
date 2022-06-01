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
import PhotoPermissionContext, {
  defaultPhotoPermissionContext,
} from "../../context/PhotoPermissionContext";
import Colors from "../../constants/Colors";
import { Text } from "../../components/Themed";

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

  const [photoPermissionStatus, setPhotoPermissionStatus] =
    useState<PermissionStatus>(defaultPhotoPermissionContext.status);

  const { all, selected: selectedPlotId } = useAppSelector((state) => state.plots);
  const selectedPlot = selectedPlotId ? all[selectedPlotId] : undefined;


  const beginPlotting = useCallback(
    (plot) => {
      setZoomLevel(MapScreenZoomLevels.Plot);
      dispatch(selectPlot(plot.id));
    },
    [selectPlot, setZoomLevel]
  );

  const endPlotting = useCallback(() => {
    dispatch(deselectTree());
    dispatch(deselectTreeCensus());
    setZoomLevel(MapScreenZoomLevels.Forest);
  }, [setMode, dispatch, setZoomLevel]);
  

  return (
    <PhotoPermissionContext.Provider
      value={{
        status: photoPermissionStatus,
        setStatus: setPhotoPermissionStatus,
      }}
    >
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
    </PhotoPermissionContext.Provider>
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
