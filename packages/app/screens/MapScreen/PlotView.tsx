import { Dimensions, View, StyleSheet, Modal } from "react-native";
import { ReactNode, useCallback, useState } from "react";

import { Ionicons } from "@expo/vector-icons";
import { Plot } from "@ong-forestry/schema";
import { PlottingSheet } from "../../components/PlottingSheet";
import { PlotDrawer } from "../../components/PlotDrawer";
import { DrawerStates, MapScreenModes } from "../../constants";
import { formPlotNumber, parsePlotNumber } from "../../constants/plots";
import useAppSelector from "../../hooks/useAppSelector";
import { RootState } from "../../redux";
import Colors from "../../constants/Colors";
import ModalContext, { defaultModalContext } from "../../context/ModalContext";

interface PlotViewProps {
  selectedPlot: Plot;
  onExit: () => void;
  endPlotting: () => void;
}

const PlotView: React.FC<PlotViewProps> = (props) => {
  const { selectedPlot, onExit, endPlotting } = props;

  const [drawerState, setDrawerState] = useState<DrawerStates>(
    DrawerStates.Minimized
  );

  const reduxState = useAppSelector((state: RootState) => state);
  const { all: allPlots } = reduxState.plots;

  return (
    <>
      <View style={styles.map}>
        <View style={{ ...styles.mapOverlay, top: 32, left: 32 }}>
          <Ionicons name="ios-arrow-back" size={32} onPress={onExit} />
        </View>
        {!!selectedPlot && (
          <PlottingSheet
            plot={selectedPlot}
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
        mode={MapScreenModes.Plot}
        drawerState={drawerState}
        plot={selectedPlot}
        endPlotting={endPlotting}
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
