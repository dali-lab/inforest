import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, StyleSheet, View, Text } from "react-native";
import { MapScreenModes, MapScreenZoomLevels } from "../../constants";

import useAppDispatch from "../../hooks/useAppDispatch";
import { selectPlot } from "../../redux/slices/plotSlice";
import { deselectTree } from "../../redux/slices/treeSlice";
import PlotView from "./PlotView";
import ForestView from "./ExploreView";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { CensusStackParamList } from "../../Screens";
import useAppSelector from "../../hooks/useAppSelector";
import { deselectTreeCensus } from "../../redux/slices/treeCensusSlice";
import Colors from "../../constants/Colors";
import { selectPlotCensus } from "../../redux/slices/plotCensusSlice";
import LoadingOverlay from "../../components/LoadingOverlay";
import OfflineBar from "../../components/OfflineBar";
import { useIsConnected } from "react-native-offline";

export default function MapScreen() {
  const route = useRoute<RouteProp<CensusStackParamList, "map">>();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

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

  const { selected: selectedForestCensusId } = useAppSelector(
    (state) => state.forestCensuses
  );
  const {
    all: allPlotCensuses,
    indices: { byForestCensuses },
  } = useAppSelector((state) => state.plotCensuses);
  const selectedPlot = selectedPlotId ? all[selectedPlotId] : undefined;

  // TODO: replace with hook
  const plotCensusesByActivePlot = useMemo(() => {
    if (!selectedForestCensusId || !byForestCensuses?.[selectedForestCensusId])
      return {};
    const index: Record<string, string> = {};
    byForestCensuses[selectedForestCensusId].forEach((plotCensusId) => {
      const census = allPlotCensuses[plotCensusId];
      index[census.plotId] = plotCensusId;
    });
    return index;
  }, [selectedForestCensusId, byForestCensuses, allPlotCensuses]);

  const beginPlotting = useCallback(
    (plot) => {
      setZoomLevel(MapScreenZoomLevels.Plot);
      dispatch(selectPlot(plot.id));
      dispatch(selectPlotCensus(plotCensusesByActivePlot[plot.id]));
    },
    [setZoomLevel, dispatch, plotCensusesByActivePlot]
  );

  const endPlotting = useCallback(() => {
    dispatch(deselectTree());
    dispatch(deselectTreeCensus());
    setZoomLevel(MapScreenZoomLevels.Forest);
    navigation.navigate("home");
  }, [dispatch, setZoomLevel]);
  return (
    <>
      {loadingTasks.size > 0 && (
        <LoadingOverlay isBackArrow={true}>
          {loadingTasks.values().next().value}
        </LoadingOverlay>
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
