import { Dimensions, View, StyleSheet } from "react-native";
import { useMemo, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { PlottingSheet } from "../../components/PlottingSheet";
import { PlotDrawer } from "../../components/PlotDrawer";
import {
  DrawerStates,
  MapScreenModes,
  MapScreenZoomLevels,
} from "../../constants";
import { formPlotNumber, parsePlotNumber } from "../../constants/plots";
import useAppSelector from "../../hooks/useAppSelector";
import Colors from "../../constants/Colors";
import useAppDispatch from "../../hooks/useAppDispatch";
import { ModeSwitcher } from "./ModeSwitcher";
import { MapOverlay } from "../../components/MapOverlay";
import {
  VisualizationConfigType,
} from "../../constants";
import { selectTree } from "../../redux/slices/treeSlice";
import LoadingOverlay from "../../components/LoadingOverlay";

const LOWER_BUTTON_HEIGHT = 64;

interface PlotViewProps {
  mode: MapScreenModes;
  switchMode: () => void;
  onExit: () => void;
}

const PlotView: React.FC<PlotViewProps> = (props) => {
  const { mode, switchMode, onExit } = props;

  const [drawerState, setDrawerState] = useState<DrawerStates>(
    DrawerStates.Minimized
  );
  const [drawerHeight, setDrawerHeight] = useState(0);

  const [direction, setDirection] = useState(0);
  const rotate = useCallback(() => {
    setDirection((direction + 1) % 4);
  }, [direction]);

  const dispatch = useAppDispatch();

  const {
    all: allPlotCensuses,
    selected: selectedPlotCensusId,
    loading: plotCensusLoading,
  } = useAppSelector((state) => state.plotCensuses);

  const {
    all: allPlots,
    selected: selectedPlotId,
    indices: { byNumber },
  } = useAppSelector((state) => state.plots);
  const { loading: treeLoading } = useAppSelector((state) => state.trees);
  const { loading: treeCensusLoading } = useAppSelector(
    (state) => state.treeCensuses
  );
  const { loading: treePhotoLoading } = useAppSelector(
    (state) => state.treePhotos
  );
  const { loading: treeCensusLabelLoading } = useAppSelector(
    (state) => state.treeCensusLabels
  );
  const selectedPlot = useMemo(
    () =>
      (selectedPlotId &&
        allPlots?.[selectedPlotId] &&
        allPlots[selectedPlotId]) ||
      undefined,
    [allPlots, selectedPlotId]
  );

  const selectedPlotCensus = useMemo(
    () =>
      (selectedPlotCensusId && allPlotCensuses?.[selectedPlotCensusId]) ||
      undefined,
    [selectedPlotCensusId, allPlotCensuses]
  );

  const {
    all: allTrees,
    indices: { byTag },
  } = useAppSelector((state) => state.trees);
  
  const findTree = useCallback(
    (treeTag: string) => {
      const tree = allTrees[byTag[treeTag]];

      if (tree && tree.plotId === selectedPlotId) {
        dispatch(selectTree(tree.id));
      } else {
        alert(
          "A tree with that tag could not be found. Please try a different tag and try again."
        );
      }
    },
    [allTrees, byTag, selectedPlotId, dispatch]
  );
  
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const NUM_OF_SPECIES = 8;
  const [visualizationConfig, setVisualizationConfig] =
    useState<VisualizationConfigType>({
      modalOpen: false,
      colorBySpecies: false,
      numOfSpecies: NUM_OF_SPECIES,
      satellite: false,
  });
  
  return (
    <>
      <View style={styles.map}>
        <MapOverlay top={32} left={32}>
          <Ionicons name="ios-arrow-back" size={32} onPress={onExit} />
        </MapOverlay>
        <View style={{ position: "absolute", top: 32, right: 32 }}>
          <ModeSwitcher mode={mode} switchMode={switchMode}></ModeSwitcher>
        </View>
        <View
          style={{ ...styles.mapOverlay, bottom: drawerHeight + 32, left: 32 }}
        >
          <Ionicons 
            name="ios-search" 
            size={32} 
            onPress={() => {
              setSearchModalOpen(true);
            }} 
          />
        </View>
        <View
          style={{ ...styles.mapOverlay, bottom: drawerHeight + 32, right: 32 }}
        >
          <Ionicons 
            name="ios-refresh" 
            size={32} 
            onPress={rotate} 
          />
        </View>
        {selectedPlot ? (
          <PlottingSheet
            mode={mode}
            plot={selectedPlot}
            plotCensus={selectedPlotCensus}
            stakeNames={(() => {
              const { i, j } = parsePlotNumber(selectedPlot.number);
              const stakeNames = [];
              stakeNames.push(selectedPlot.number);
              if (formPlotNumber(i + 1, j) in byNumber) {
                stakeNames.push(
                  allPlots[byNumber[formPlotNumber(i + 1, j)]].number
                );
              } else {
                stakeNames.push("No stake");
              }
              if (formPlotNumber(i + 1, j + 1) in byNumber) {
                stakeNames.push(
                  allPlots[byNumber[formPlotNumber(i + 1, j + 1)]].number
                );
              } else {
                stakeNames.push("No stake");
              }
              if (formPlotNumber(i, j + 1) in byNumber) {
                stakeNames.push(
                  allPlots[byNumber[formPlotNumber(i, j + 1)]].number
                );
              } else {
                stakeNames.push("No stake");
              }
              return stakeNames;
            })()}
            mapWidth={Dimensions.get("window").width}
            direction={direction}
            drawerState={drawerState}
            expandDrawer={() => setDrawerState(DrawerStates.Expanded)}
            minimizeDrawer={() => setDrawerState(DrawerStates.Minimized)}
          />
        ) : null}
      </View>
      <PlotDrawer
        mode={mode}
        zoom={MapScreenZoomLevels.Plot}
        drawerState={drawerState}
        setDrawerHeight={setDrawerHeight}
        plot={selectedPlot}
        plotCensus={selectedPlotCensus}
        expandDrawer={() => setDrawerState(DrawerStates.Expanded)}
        minimizeDrawer={() => setDrawerState(DrawerStates.Minimized)}
        stopPlotting={onExit}
      ></PlotDrawer>
      {treeLoading && <LoadingOverlay>Creating Tree</LoadingOverlay>}
      {treeCensusLoading && (
        <LoadingOverlay>Creating Tree Census</LoadingOverlay>
      )}
      {plotCensusLoading && <LoadingOverlay>Reloading Plot</LoadingOverlay>}
      {treePhotoLoading && <LoadingOverlay>Uploading Photo</LoadingOverlay>}
      {treeCensusLabelLoading && (
        <LoadingOverlay>Uploading Label</LoadingOverlay>
      )}
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
    width: LOWER_BUTTON_HEIGHT,
    height: LOWER_BUTTON_HEIGHT,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PlotView;
