import { Dimensions, View, StyleSheet } from "react-native";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Plot } from "@ong-forestry/schema";
import { PlottingSheet } from "../../components/PlottingSheet";
import { PlotDrawer } from "../../components/PlotDrawer";
import {
  DrawerStates,
  MapScreenModes,
  MapScreenZoomLevels,
} from "../../constants";
import { formPlotNumber, parsePlotNumber } from "../../constants/plots";
import useAppSelector from "../../hooks/useAppSelector";
import { RootState } from "../../redux";
import Colors from "../../constants/Colors";
import { ModeSwitcher } from "./ModeSwitcher";
import { MapOverlay } from "../../components/MapOverlay";

interface PlotViewProps {
  mode: MapScreenModes;
  switchMode: () => void;
  selectedPlot: Plot;
  onExit: () => void;
}

const PlotView: React.FC<PlotViewProps> = (props) => {
  const { mode, switchMode, selectedPlot, onExit } = props;

  const [drawerState, setDrawerState] = useState<DrawerStates>(
    DrawerStates.Minimized
  );

  const reduxState = useAppSelector((state: RootState) => state);
  const { selected: selectedForestCensus } = reduxState.forestCensuses;
  const {
    indices: { byPlots: plotCensusesByPlot },
  } = reduxState.plotCensuses;
  const {
    indices: { byPlotCensuses },
  } = reduxState.treeCensuses;
  const { all: allPlots } = reduxState.plots;

  const selectedPlotCensus = useMemo(
    () =>
      (selectedPlot &&
        selectedForestCensus &&
        plotCensusesByPlot?.[selectedPlot?.id]?.[selectedForestCensus?.id]) ||
      undefined,
    [selectedForestCensus, plotCensusesByPlot, selectedPlot]
  );

  return (
    <>
      <View style={styles.map}>
        <MapOverlay top={32} left={32}>
          <Ionicons name="ios-arrow-back" size={32} onPress={onExit} />
        </MapOverlay>
        <View style={{ position: "absolute", top: 32, right: 32 }}>
          <ModeSwitcher mode={mode} switchMode={switchMode}></ModeSwitcher>
        </View>
        {!!selectedPlot && (
          <PlottingSheet
            mode={mode}
            plot={selectedPlot}
            plotCensus={selectedPlotCensus}
            stakeNames={(() => {
              const { i, j } = parsePlotNumber(selectedPlot.number);
              const stakeNames = [];
              stakeNames.push(selectedPlot.number);
              if (formPlotNumber(i + 1, j) in allPlots) {
                stakeNames.push(allPlots[formPlotNumber(i + 1, j)].number);
              } else {
                stakeNames.push("No stake");
              }
              if (formPlotNumber(i + 1, j + 1) in allPlots) {
                stakeNames.push(allPlots[formPlotNumber(i + 1, j + 1)].number);
              } else {
                stakeNames.push("No stake");
              }
              if (formPlotNumber(i, j + 1) in allPlots) {
                stakeNames.push(allPlots[formPlotNumber(i, j + 1)].number);
              } else {
                stakeNames.push("No stake");
              }
              return stakeNames;
            })()}
            mapWidth={Dimensions.get("window").width}
            expandDrawer={() => setDrawerState(DrawerStates.Expanded)}
            minimizeDrawer={() => setDrawerState(DrawerStates.Minimized)}
          />
        )}
      </View>
      <PlotDrawer
        mode={mode}
        zoom={MapScreenZoomLevels.Plot}
        drawerState={drawerState}
        plot={selectedPlot}
        plotCensus={selectedPlotCensus}
        expandDrawer={() => setDrawerState(DrawerStates.Expanded)}
        minimizeDrawer={() => setDrawerState(DrawerStates.Minimized)}
      ></PlotDrawer>
    </>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.secondary.dark,
    justifyContent: "center",
    alignItems: "center",
  },
  mapOverlay: {
    position: "absolute",
    backgroundColor: "white",
    width: 64,
    height: 64,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PlotView;
