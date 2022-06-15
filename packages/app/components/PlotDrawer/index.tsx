import React, { useCallback, useEffect, useMemo } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Queue, Stack } from "react-native-spacing-system";
import { BlurView } from "expo-blur";
import {
  Plot,
  PlotCensus,
  PlotCensusStatuses,
  Tree,
  TreeCensus,
} from "@ong-forestry/schema";
import { Ionicons } from "@expo/vector-icons";

import {
  MapScreenModes,
  DrawerStates,
  BLUR_VIEW_INTENSITY,
  MapScreenZoomLevels,
} from "../../constants";
import useAppSelector from "../../hooks/useAppSelector";
import {
  locallyDeleteTree,
  deselectTree,
  updateTree,
  locallyUpdateTree,
} from "../../redux/slices/treeSlice";
import AppButton from "../AppButton";
import { Text, TextStyles, TextVariants } from "../Themed";
import useAppDispatch from "../../hooks/useAppDispatch";
import DataEntryForm from "./DataEntryForm";
import FlagIcon from "../../assets/icons/flag-icon.svg";
import Colors from "../../constants/Colors";

import {
  createTreeCensus,
  deselectTreeCensus,
  locallyCreateTreeCensus,
  locallyUpdateTreeCensus,
  updateTreeCensus,
} from "../../redux/slices/treeCensusSlice";
import { useIsConnected } from "react-native-offline";
import { AUTHOR_ID } from "../../constants/dev";

const SearchBar = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        width: "100%",
        backgroundColor: "white",
        borderRadius: 12,
        paddingVertical: 6,
        paddingHorizontal: 12,
      }}
    >
      <Ionicons name="ios-search" size={24}></Ionicons>
      <Queue size={6}></Queue>
      <TextInput
        style={{
          ...TextStyles[TextVariants.Body],
        }}
        returnKeyType="search"
        placeholder="Search for trees"
      ></TextInput>
    </View>
  );
};

const blankTreeCensus: Omit<
  TreeCensus,
  "id" | "treeId" | "plotCensusId" | "authorId"
> = {
  dbh: 0,
  labels: [],
  photos: [],
  flagged: false,
};

type PlotDrawerProps = {
  mode: MapScreenModes;
  zoom: MapScreenZoomLevels;
  drawerState: DrawerStates;
  plot?: Plot;
  startCensus?: () => void;
  plotCensus: PlotCensus | undefined;
  // forest?: Forest;
  expandDrawer: () => void;
  minimizeDrawer: () => void;
  // beginPlotting?: () => void;
  setDrawerHeight?: (height: number) => void;
};

export const PlotDrawer: React.FC<PlotDrawerProps> = ({
  mode,
  zoom,
  drawerState,
  plot,
  plotCensus,
  // forest,
  // beginPlotting,
  // startCensus,
  // expandDrawer,
  minimizeDrawer,
  setDrawerHeight,
}) => {
  const dispatch = useAppDispatch();
  const {
    all: allTrees,
    selected: selectedTreeId,
    indices: { byPlots },
  } = useAppSelector((state) => state.trees);
  const { all: allForests, selected: selectedForestId } = useAppSelector(
    (state) => state.forest
  );
  const {
    all: allTreeCensuses,
    selected: selectedTreeCensusId,
    indices: { byTreeActive },
  } = useAppSelector((state) => state.treeCensuses);
  const { all: allForestCensuses, selected: selectedForestCensusId } =
    useAppSelector((state) => state.forestCensuses);
  const selectedTree = useMemo(
    () => (selectedTreeId ? allTrees[selectedTreeId] : undefined),
    [allTrees, selectedTreeId]
  );
  const selectedTreeCensus = useMemo(
    () =>
      (selectedTreeCensusId && allTreeCensuses?.[selectedTreeCensusId]) ||
      undefined,
    [selectedTreeCensusId, allTreeCensuses]
  );

  const selectedForest = useMemo(
    () => (selectedForestId && allForests?.[selectedForestId]) || undefined,
    [allForests, selectedForestId]
  );

  useEffect(() => {}, [selectedTreeCensusId]);
  const selectedForestCensus = useMemo(
    () =>
      (selectedForestCensusId && allForestCensuses?.[selectedForestCensusId]) ||
      undefined,
    [selectedForestCensusId, allForestCensuses]
  );

  const isConnected = useIsConnected();

  const setStyle = useCallback(() => {
    switch (drawerState) {
      case DrawerStates.Closed:
        return styles.containerClosed;
      case DrawerStates.Minimized:
        return styles.containerMinimized;
      case DrawerStates.Expanded:
        return styles.containerExpanded;
    }
  }, [drawerState]);

  // TODO: fix this by pulling from date of most recent Plot Census. May require additional column and new RTK indices
  const computePlotLastUpdatedDate = useCallback(
    (plotId: string) => {
      const plotTrees = byPlots?.[plotId];
      let latestCensus: Date | undefined;
      plotTrees instanceof Set &&
        plotTrees.forEach((treeId) => {
          const { updatedAt } = allTrees[treeId];
          if (updatedAt && (!latestCensus || updatedAt > latestCensus)) {
            latestCensus = updatedAt;
          }
        });
      return latestCensus;
    },
    [byPlots, allTrees]
  );

  const editTree = useCallback(
    (updatedFields) => {
      if (selectedTree) {
        try {
          const updated: Tree = { ...selectedTree, ...updatedFields };
          isConnected
            ? dispatch(updateTree(updated))
            : dispatch(locallyUpdateTree(updated));
        } catch (err: any) {
          alert(err?.message || "An unknown error occurred.");
        }
      }
    },
    [dispatch, selectedTree, isConnected]
  );

  const editTreeCensus = useCallback(
    async (updatedFields) => {
      if (selectedTreeCensus?.id) {
        try {
          const updated: TreeCensus = {
            ...selectedTreeCensus,
            ...updatedFields,
          };
          isConnected
            ? dispatch(updateTreeCensus(updated))
            : dispatch(locallyUpdateTreeCensus(updated));
        } catch (err: any) {
          alert(err?.message || "An unknown error occurred.");
        }
      }
    },
    [dispatch, selectedTreeCensus, isConnected]
  );

  const toggleFlagged = useCallback(async () => {
    if (selectedTreeCensus?.id) {
      editTreeCensus({ flagged: !selectedTreeCensus.flagged });
    }
  }, [selectedTreeCensus, editTreeCensus]);

  useEffect(() => {
    if (
      selectedTree?.plotId &&
      selectedTree?.id &&
      plotCensus?.id &&
      !byTreeActive?.[selectedTree.id]
    ) {
      try {
        const newCensus = {
          ...blankTreeCensus,
          treeId: selectedTree?.id,
          plotCensusId: plotCensus.id,
          authorId: AUTHOR_ID,
        };
        isConnected
          ? dispatch(createTreeCensus(newCensus))
          : dispatch(locallyCreateTreeCensus(newCensus));
      } catch (err: any) {
        alert(err?.message || "An unknown error occurred.");
      }
    }
  }, [selectedTree, plotCensus, dispatch, isConnected, byTreeActive]);

  if (drawerState === DrawerStates.Closed) {
    return null;
  }

  return selectedForest ? (
    <Animated.View
      style={{ ...styles.container, ...setStyle() }}
      onLayout={(e) => {
        setDrawerHeight && setDrawerHeight(e.nativeEvent.layout.height);
      }}
    >
      <BlurView style={styles.blurContainer} intensity={BLUR_VIEW_INTENSITY}>
        {zoom === MapScreenZoomLevels.Forest && (
          <View style={{}}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text variant={TextVariants.H2}>{selectedForest?.name}</Text>
              {mode === MapScreenModes.Plot && (
                <>
                  <Queue size={36}></Queue>
                  <Text variant={TextVariants.Body}>
                    {selectedForestCensus?.name || "No project selected"}
                  </Text>
                </>
              )}
            </View>
            <Stack size={24}></Stack>
            <SearchBar></SearchBar>
          </View>
        )}
        {zoom === MapScreenZoomLevels.Plot && !!plot && (
          <>
            {drawerState === "MINIMIZED" && (
              <View style={{}}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text variant={TextVariants.H2}>Plot #{plot.number}</Text>
                    {mode === MapScreenModes.Plot && (
                      <>
                        <Queue size={36}></Queue>
                        <Text variant={TextVariants.Body}>
                          Tap anywhere to plot a new tree
                        </Text>
                      </>
                    )}
                  </View>
                  <AppButton
                    onPress={() => {}}
                    disabled={
                      plotCensus?.status !== PlotCensusStatuses.InProgress
                    }
                  >
                    Submit for review
                  </AppButton>
                </View>
                <Stack size={24}></Stack>
                <SearchBar></SearchBar>
              </View>
            )}
            {drawerState === "EXPANDED" && !!selectedTree && plot && (
              <View
                style={{
                  flexDirection: "row",
                  // justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <View style={{ flexDirection: "column", flex: 1 }}>
                  <Text variant={TextVariants.H2}>
                    New Census Entry in Plot {plot.number}
                  </Text>
                  <Text variant={TextVariants.Body}>
                    This is the {byPlots[plot.id].size + 1}th tree in the plot.
                  </Text>
                </View>
                <AppButton
                  style={{ marginHorizontal: 12 }}
                  onPress={toggleFlagged}
                  type={selectedTreeCensus?.flagged ? "RED" : "PLAIN"}
                  icon={
                    <FlagIcon
                      height={16}
                      width={16}
                      style={{ marginRight: 12 }}
                      strokeWidth={4}
                      stroke={selectedTreeCensus?.flagged ? "white" : "black"}
                    />
                  }
                >
                  {selectedTreeCensus?.flagged ? "Flagged" : "Flag"} for Review
                </AppButton>
                <Ionicons name="close" size={24} onPress={minimizeDrawer} />
              </View>
            )}
            {drawerState === "EXPANDED" && !!selectedTree && (
              <>
                {!!selectedTreeCensus && (
                  <>
                    <Stack size={24}></Stack>
                    <DataEntryForm
                      selectedTree={selectedTree}
                      selectedTreeCensus={selectedTreeCensus}
                      editTree={editTree}
                      editTreeCensus={editTreeCensus}
                      cancel={() => {
                        dispatch(locallyDeleteTree(selectedTree.id));
                        dispatch(deselectTreeCensus());
                        dispatch(deselectTree());
                        minimizeDrawer();
                      }}
                      finish={() => {
                        minimizeDrawer();
                      }}
                      style={{ flex: 1 }}
                    />
                  </>
                )}
              </>
            )}
          </>
        )}
      </BlurView>
    </Animated.View>
  ) : null;
};

export default PlotDrawer;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    zIndex: 2,
    width: Dimensions.get("window").width,
    backgroundColor: Colors.blurViewBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  blurContainer: {
    width: "100%",
    height: "100%",
    padding: 24,
  },
  containerClosed: {
    display: "none",
  },
  containerMinimized: {},
  containerExpanded: {},
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
