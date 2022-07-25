import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { MapScreenModes } from "../../constants";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ExploreScreen from "./ExploreScreen";
import PlotScreen from "./PlotScreen";
import PlotTableScreen from "./PlotTableScreen";

export type MapStackParamList = {
  explore: Record<string, unknown>;
  plot: Record<string, unknown>;
  plotTable: Record<string, unknown>;
};

const MapStack = createNativeStackNavigator<MapStackParamList>();

export default function MapScreen() {
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
        <MapStack.Screen name="plotTable" component={PlotTableScreen} />
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
