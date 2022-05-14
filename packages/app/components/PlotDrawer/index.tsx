import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { Queue, Stack } from "react-native-spacing-system";
import { BlurView } from "expo-blur";
import dateformat from "dateformat";
import { Forest, Plot, PlotCensus, TreeCensus } from "@ong-forestry/schema";
import { Ionicons } from "@expo/vector-icons";
import { MapScreenModes, DrawerStates } from "../../constants";
import useAppSelector from "../../hooks/useAppSelector";
import { locallyDeleteTree, deselectTree } from "../../redux/slices/treeSlice";
import AppButton from "../AppButton";
import { Text, TextVariants } from "../Themed";
import useAppDispatch from "../../hooks/useAppDispatch";
import DataEntryForm from "./DataEntryForm";
import FlagIcon from "../../assets/icons/flag-icon.svg";
import {
  createTreeCensus,
  deselectTreeCensus,
  locallyDraftNewTreeCensus,
  locallyUpdateTreeCensus,
} from "../../redux/slices/treeCensusSlice";
import { createPlotCensus } from "../../redux/slices/plotCensusSlice";

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
  drawerState: DrawerStates;
  plot?: Plot;
  plotCensus: PlotCensus | undefined;
  forest?: Forest;
  expandDrawer: () => void;
  minimizeDrawer: () => void;
} & (
  | {
      mode: MapScreenModes.Select | MapScreenModes.Explore;
      beginPlotting: () => void;
      endPlotting?: undefined;
      setDrawerHeight: (height: number) => void;
    }
  | {
      mode: MapScreenModes.Plot;
      beginPlotting?: undefined;
      endPlotting: () => void;
      setDrawerHeight?: (height: number) => void;
    }
);

export const PlotDrawer: React.FC<PlotDrawerProps> = ({
  mode,
  drawerState,
  plot,
  plotCensus,
  setDrawerHeight,
  beginPlotting,
  expandDrawer,
  minimizeDrawer,
}) => {
  useEffect(() => {
    return function cleanup() {
      setDrawerHeight && setDrawerHeight(0);
    };
  }, [setDrawerHeight]);
  const dispatch = useAppDispatch();
  const {
    all,
    selected: selectedTreeId,
    indices: { byPlots },
  } = useAppSelector((state) => state.trees);
  const {
    all: allTreeCensuses,
    selected: selectedTreeCensusId,
    indices: { byTreeActive },
  } = useAppSelector((state) => state.treeCensuses);
  const { all: allForestCensuses, selected: selectedForestCensusId } =
    useAppSelector((state) => state.forestCensuses);
  const selectedTree = useMemo(
    () => (selectedTreeId ? all[selectedTreeId] : undefined),
    [all, selectedTreeId]
  );
  const selectedTreeCensus = useMemo(
    () =>
      (selectedTreeCensusId && allTreeCensuses?.[selectedTreeCensusId]) ||
      undefined,
    [selectedTreeCensusId, allTreeCensuses]
  );
  const selectedForestCensus = useMemo(
    () =>
      (selectedForestCensusId && allForestCensuses?.[selectedForestCensusId]) ||
      undefined,
    [selectedForestCensusId, allForestCensuses]
  );

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

  const computePlotLastUpdatedDate = useCallback(
    (plotId: string) => {
      const plotTrees = byPlots[plotId];
      let latestCensus: Date | undefined;
      for (const treeTag of plotTrees) {
        const { updatedAt } = all[treeTag];
        if (updatedAt && (!latestCensus || updatedAt > latestCensus)) {
          latestCensus = updatedAt;
        }
      }
      return latestCensus;
    },
    [byPlots, all]
  );

  const startCensus = useCallback(() => {
    if (plot && selectedForestCensus) {
      dispatch(createPlotCensus(plot.id));
    }
  }, [dispatch, selectedForestCensus, plot]);

  const toggleFlagged = useCallback(() => {
    if (selectedTreeCensus?.id) {
      dispatch(
        locallyUpdateTreeCensus({
          updated: {
            ...selectedTreeCensus,
            flagged: !selectedTreeCensus?.flagged,
          },
        })
      );
    }
  }, [dispatch, locallyUpdateTreeCensus, selectedTreeCensus]);

  useEffect(() => {
    if (
      selectedTree?.plotId &&
      selectedTree?.id &&
      plotCensus?.id &&
      !byTreeActive[selectedTree.id]
    ) {
      try {
        dispatch(
          locallyDraftNewTreeCensus({
            newCensus: {
              ...blankTreeCensus,
              treeId: selectedTree?.id,
              plotCensusId: plotCensus.id,
            },
          })
        );
      } catch (err: any) {
        alert(err?.message || "An unknown error occurred.");
      }
    }
  }, [selectedTree, plotCensus, dispatch, byTreeActive]);

  if (drawerState === DrawerStates.Closed) {
    return null;
  }

  return (
    <Animated.View
      style={{ ...styles.container, ...setStyle() }}
      onLayout={(e) => {
        setDrawerHeight && setDrawerHeight(e.nativeEvent.layout.height);
      }}
    >
      <BlurView style={styles.blurContainer} intensity={40}>
        {mode === MapScreenModes.Select && !!plot && (
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text variant={TextVariants.H2}>Plot #{plot.number}</Text>
              <Queue size={36}></Queue>
              <>
                {(() => {
                  const lastUpdated = computePlotLastUpdatedDate(plot.id);
                  return (
                    <Text variant={TextVariants.Body}>
                      {lastUpdated
                        ? `Last censused on ${dateformat(
                            lastUpdated,
                            "mmm dS, yyyy"
                          )}`
                        : "Never censused"}
                    </Text>
                  );
                })()}
              </>
            </View>
            {drawerState === "MINIMIZED" &&
              (plotCensus ? (
                <AppButton onPress={beginPlotting}>Add Trees</AppButton>
              ) : (
                <AppButton onPress={startCensus}>Begin Censusing</AppButton>
              ))}
          </View>
        )}
        {mode === MapScreenModes.Explore && (
          <View style={[styles.header]}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text variant={TextVariants.H2}>O-Farm</Text>
              <Queue size={36}></Queue>
              <Text variant={TextVariants.Body}>Select any plot to begin</Text>
            </View>
          </View>
        )}
        {mode === MapScreenModes.Plot && !!plot && (
          <>
            <View style={styles.header}>
              {drawerState === "MINIMIZED" && !selectedTree && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text variant={TextVariants.H2}>Plot #{plot.number}</Text>
                  <Queue size={36}></Queue>
                  <Text variant={TextVariants.Body}>
                    Tap anywhere to plot a new tree
                  </Text>
                </View>
              )}
              {drawerState === "MINIMIZED" && !!selectedTree && (
                <>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text variant={TextVariants.H2}>
                      Tree #{selectedTree.tag}
                    </Text>
                    <Queue size={36}></Queue>
                    <Text variant={TextVariants.Body}>
                      Last census on{" "}
                      {dateformat(
                        selectedTree.updatedAt,
                        'mmm dS, yyyy "at" h:MM TT'
                      )}
                    </Text>
                  </View>
                  <AppButton onPress={expandDrawer}>
                    {selectedTreeCensus ? "Edit Census" : "Add Census"}
                  </AppButton>
                </>
              )}
              {drawerState === "EXPANDED" && !!selectedTree && (
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
                      This is the {byPlots[plot.id].size + 1}th tree in the
                      plot.
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
                    {selectedTreeCensus?.flagged ? "Flagged" : "Flag"} for
                    Review
                  </AppButton>
                  <Ionicons name="close" size={24} onPress={minimizeDrawer} />
                </View>
              )}
            </View>

            {drawerState === "EXPANDED" && !!selectedTree && (
              <>
                <Stack size={24}></Stack>
                <View>
                  {plotCensus && (
                    <DataEntryForm
                      selectedTree={selectedTree}
                      selectedTreeCensus={selectedTreeCensus}
                      cancel={() => {
                        dispatch(locallyDeleteTree(selectedTree.id));
                        dispatch(deselectTreeCensus());
                        dispatch(deselectTree());
                        minimizeDrawer();
                      }}
                      finish={(newTreeCensus) => {
                        dispatch(createTreeCensus(newTreeCensus));
                        console.log("newTreeCensus", newTreeCensus);
                        minimizeDrawer();
                      }}
                      style={{ flex: 1 }}
                    />
                  )}
                </View>
              </>
            )}
          </>
        )}
      </BlurView>
    </Animated.View>
  );
};

export default PlotDrawer;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    zIndex: 2,
    width: Dimensions.get("window").width,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
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
