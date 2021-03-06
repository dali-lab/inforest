import { Dimensions, View, StyleSheet } from "react-native";
import { useMemo, useState, useCallback, useEffect } from "react";
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
import { VisualizationConfigType } from "../../constants";
import { deselectTree, selectTree } from "../../redux/slices/treeSlice";
import LoadingOverlay from "../../components/LoadingOverlay";
import VisualizationModal from "../../components/VisualizationModal";
import SearchModal from "../../components/SearchModal";
import { deselectTreeCensus } from "../../redux/slices/treeCensusSlice";
import { useNavigation } from "@react-navigation/native";
import { useIsConnected } from "react-native-offline";

const LOWER_BUTTON_HEIGHT = 64;

type PlotViewProps = {
  mode: MapScreenModes;
};

const PlotView: React.FC<PlotViewProps> = (props) => {
  const { mode } = props;

  const isConnected = useIsConnected();

  const [viewMode, setViewMode] = useState<MapScreenModes>(mode);

  const navigation = useNavigation();

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
  const { loadingTasks } = useAppSelector((state) => state.sync);
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

  const onExit = useCallback(() => {
    dispatch(deselectTree());
    dispatch(deselectTreeCensus());
    navigation.goBack();
  }, [dispatch, navigation]);

  const switchMode = useCallback(() => {
    switch (viewMode) {
      case MapScreenModes.Explore:
        setViewMode(MapScreenModes.Plot);
        break;
      case MapScreenModes.Plot:
        setViewMode(MapScreenModes.Explore);
        break;
    }
  }, [viewMode, setViewMode, navigation]);

  useEffect(() => {
    if (!selectedPlot) navigation.goBack();
  }, [selectedPlot]);

  return (
    <>
      <View style={styles.map}>
        {loadingTasks && loadingTasks.size > 0 && (
          <LoadingOverlay isBackArrow>
            {loadingTasks.values().next().value}
          </LoadingOverlay>
        )}
        <MapOverlay top={32} left={32}>
          <Ionicons name="ios-arrow-back" size={32} onPress={onExit} />
        </MapOverlay>
        <View style={{ position: "absolute", top: 32, right: 32 }}>
          <ModeSwitcher mode={viewMode} switchMode={switchMode}></ModeSwitcher>
        </View>
        <View style={{ position: "absolute", top: 100 }}>
          {direction === 0 && <Ionicons name="arrow-up" size={100} />}
          {direction === 1 && <Ionicons name="arrow-forward" size={100} />}
          {direction === 2 && <Ionicons name="arrow-down" size={100} />}
          {direction === 3 && <Ionicons name="arrow-back" size={100} />}
        </View>
        <View style={{ position: "absolute" }}>
          <VisualizationModal
            config={visualizationConfig}
            setConfig={setVisualizationConfig}
            visible={visualizationConfig.modalOpen}
            setVisible={() => {
              setVisualizationConfig((prev) => ({
                ...prev,
                modalOpen: !prev.modalOpen,
              }));
            }}
          />
          {
            <SearchModal
              open={searchModalOpen}
              onExit={() => {
                setSearchModalOpen(false);
              }}
              onSubmit={(searchValue: string) => {
                setSearchModalOpen(false);
                findTree(searchValue);
              }}
            />
          }
        </View>
        <MapOverlay bottom={drawerHeight + 32} left={32}>
          <Ionicons
            name="ios-search"
            size={32}
            onPress={() => {
              setSearchModalOpen(true);
            }}
          />
        </MapOverlay>
        <MapOverlay bottom={drawerHeight + 32} right={32}>
          <Ionicons name="ios-refresh" size={32} onPress={rotate} />
        </MapOverlay>
        {selectedPlot ? (
          <PlottingSheet
            mode={viewMode}
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
        mode={viewMode}
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
    backgroundColor: Colors.secondary.light,
    justifyContent: "center",
    alignItems: "center",
  },
  mapOverlay: {
    position: "absolute",
    backgroundColor: Colors.blurViewBackground,
    width: LOWER_BUTTON_HEIGHT,
    height: LOWER_BUTTON_HEIGHT,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PlotView;
