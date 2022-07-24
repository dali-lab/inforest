import React, { useMemo } from "react";
import { Dimensions, StyleSheet } from "react-native";
import { MapScreenModes } from "../../constants";
import useAppSelector from "../../hooks/useAppSelector";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ExploreScreen from "./ExploreScreen";
import PlotScreen from "./PlotScreen";

export type MapStackParamList = {
  explore: Record<string, unknown>;
  plot: Record<string, unknown>;
};

const MapStack = createNativeStackNavigator<MapStackParamList>();

export default function MapScreen() {
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

  return (
    <>
      <MapStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="explore"
      >
        <MapStack.Screen
          name="explore"
          component={ExploreScreen}
          initialParams={{ mode: MapScreenModes.Plot }}
        />
        <MapStack.Screen
          name="plot"
          component={PlotScreen}
          initialParams={{ mode: MapScreenModes.Plot }}
        />
      </MapStack.Navigator>
      {/*       
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
      </View> */}
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
