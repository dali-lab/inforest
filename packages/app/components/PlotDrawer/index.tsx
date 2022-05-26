import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { Queue, Stack } from "react-native-spacing-system";
import { BlurView } from "expo-blur";
import dateformat from "dateformat";
import { Forest, Plot, PlotCensus, TreeCensus } from "@ong-forestry/schema";
import { Ionicons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";

import {
  MapScreenModes,
  DrawerStates,
  BLUR_VIEW_INTENSITY,
} from "../../constants";
import useAppSelector from "../../hooks/useAppSelector";
import { locallyDeleteTree, deselectTree } from "../../redux/slices/treeSlice";
import AppButton from "../AppButton";
import { Text, TextVariants } from "../Themed";
import useAppDispatch from "../../hooks/useAppDispatch";
import DataEntryForm from "./DataEntryForm";
import FlagIcon from "../../assets/icons/flag-icon.svg";
import Colors from "../../constants/Colors";

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
      mode: MapScreenModes.Explore;
      beginPlotting: () => void;
      setDrawerHeight: (height: number) => void;
    }
  | {
      mode: MapScreenModes.Plot;
      beginPlotting?: undefined;
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
  const dispatch = useAppDispatch();
  const {
    all,
    selected: selectedTreeTag,
    indices: { byPlots },
  } = useAppSelector((state) => state.trees);
  const { currentForest } = useAppSelector((state) => state.forest);
  const {
    drafts,
    indices: { byPlotCensuses },
  } = useAppSelector((state) => state.treeCensuses);
  const {
    all: allForestCensuses,
    selected: selectedForestCensus,
    indices: { byForests: thisForestCensuses },
  } = useAppSelector((state) => state.forestCensuses);
  const selected = selectedTreeTag ? all[selectedTreeTag] : undefined;
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
      selected &&
      byPlotCensuses?.[plotCensus?.id]?.[selected.tag]?.flagged) ||
      false
  );

  const toggleFlagged = useCallback(() => {
    setFlagged((prev) => !prev);
  }, [setFlagged]);

  const inProgressCensuses = useMemo(() => Object.keys(drafts), [drafts]);

  if (drawerState === DrawerStates.Closed) {
    return null;
  }

  return (
    currentForest && (
      <Animated.View
        style={{ ...styles.container, ...setStyle() }}
        onLayout={(e) => {
          console.log("setting height", e.nativeEvent.layout.height);
          setDrawerHeight && setDrawerHeight(e.nativeEvent.layout.height);
        }}
      >
        <BlurView style={styles.blurContainer} intensity={BLUR_VIEW_INTENSITY}>
          {!!plot && (
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
          {mode === MapScreenModes.Explore && !plot && (
            <View style={[styles.header]}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text variant={TextVariants.H2}>O-Farm</Text>
                <Queue size={36}></Queue>
                <RNPickerSelect
                  value={selectedForestCensus?.id}
                  onValueChange={(value) => console.log(value)}
                  items={Object.values(
                    thisForestCensuses[currentForest.id]
                  ).map((censusId) => ({
                    label: allForestCensuses[censusId].name,
                    value: allForestCensuses[censusId].id,
                  }))}
                />
                <Text variant={TextVariants.Body}>
                  Select any plot to begin
                </Text>
              </View>
            </View>
          )}
          {mode === MapScreenModes.Plot && !!plot && (
            <>
              <View style={styles.header}>
                {drawerState === "MINIMIZED" && !selected && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text variant={TextVariants.H2}>Plot #{plot.number}</Text>
                    <Queue size={36}></Queue>
                    <Text variant={TextVariants.Body}>
                      Tap anywhere to plot a new tree
                    </Text>
                  </View>
                )}
                {drawerState === "MINIMIZED" && !!selected && (
                  <>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text variant={TextVariants.H2}>
                        Tree #{selected.tag}
                      </Text>
                      <Queue size={36}></Queue>
                      <Text variant={TextVariants.Body}>
                        Last census on{" "}
                        {dateformat(
                          selected.updatedAt,
                          'mmm dS, yyyy "at" h:MM TT'
                        )}
                      </Text>
                    </View>
                    <AppButton onPress={expandDrawer}>
                      {selected.tag in inProgressCensuses
                        ? "Edit Census"
                        : "Add Census"}
                    </AppButton>
                  </>
                )}
                {drawerState === "EXPANDED" && !!selected && (
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

              {drawerState === "EXPANDED" && !!selected && (
                <>
                  <Stack size={24}></Stack>
                  <View>
                    {plotCensus && (
                      <DataEntryForm
                        treeCensus={
                          byPlotCensuses?.[plotCensus?.id]?.[selected.tag] || {
                            ...blankTreeCensus,
                            plotCensusId: plotCensus.id,
                            treeId: selected.id,
                            authorId: "",
                            flagged: flagged,
                            id: "",
                          }
                        }
                        flagged={flagged}
                        cancel={() => {
                          dispatch(locallyDeleteTree(selected.tag));
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
    )
  );
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
