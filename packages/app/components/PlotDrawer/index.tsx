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
    selected: selectedTreeTag,
    indices: { byPlots },
  } = useAppSelector((state) => state.trees);
  const {
    all: allTreeCensuses,
    drafts,
    indices: { byPlotCensuses, byTreeActive },
  } = useAppSelector((state) => state.treeCensuses);
  const selectedTree = useMemo(
    () => (selectedTreeTag ? all[selectedTreeTag] : undefined),
    [all, selectedTreeTag]
  );
  const selectedTreeCensus = useMemo(
    () =>
      (selectedTree &&
        byTreeActive[selectedTree.id] &&
        allTreeCensuses[byTreeActive[selectedTree.id]]) ||
      undefined,
    [selectedTree, allTreeCensuses, byTreeActive]
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

  const [flagged, setFlagged] = useState<boolean>(
    (plotCensus &&
      selectedTree &&
      allTreeCensuses[byTreeActive?.[selectedTree.id]].flagged) ||
      false
  );

  const toggleFlagged = useCallback(() => {
    setFlagged((prev) => !prev);
  }, [setFlagged]);

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
            {drawerState === "MINIMIZED" && (
              <AppButton onPress={beginPlotting}>Add Trees</AppButton>
            )}
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
                    type={flagged ? "RED" : "PLAIN"}
                    icon={
                      <FlagIcon
                        height={16}
                        width={16}
                        style={{ marginRight: 12 }}
                        strokeWidth={4}
                        stroke={flagged ? "white" : "black"}
                      />
                    }
                  >
                    {flagged ? "Flagged" : "Flag"} for Review
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
                      treeCensus={
                        selectedTreeCensus || {
                          ...blankTreeCensus,
                          plotCensusId: plotCensus.id,
                          treeId: selectedTree.id,
                          authorId: "",
                          flagged: flagged,
                          id: "",
                        }
                      }
                      flagged={flagged}
                      cancel={() => {
                        dispatch(locallyDeleteTree(selectedTree.tag));
                        dispatch(deselectTree());
                        minimizeDrawer();
                      }}
                      finish={minimizeDrawer}
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
