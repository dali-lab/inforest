import React, { useCallback, useEffect } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { Queue, Stack } from "react-native-spacing-system";
import { BlurView } from "expo-blur";
import dateformat from "dateformat";
import { Forest, Plot } from "@ong-forestry/schema";
import { Ionicons } from "@expo/vector-icons";
import { MapScreenModes, DrawerStates } from "../../constants";
import useAppSelector from "../../hooks/useAppSelector";
import { locallyDeleteTree, deselectTree } from "../../redux/slices/treeSlice";
import DrawerButton from "../DrawerButton";
import { Text, TextVariants } from "../Themed";
import useAppDispatch from "../../hooks/useAppDispatch";
import DataEntryForm from "./DataEntryForm";
import FlagIcon from "../../assets/icons/flag-icon.svg";

type PlotDrawerProps = {
  drawerState: DrawerStates;
  plot?: Plot;
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
  setDrawerHeight,
  beginPlotting,
  expandDrawer,
  minimizeDrawer,
}) => {
  useEffect(() => {
    return function cleanup() {
      setDrawerHeight && setDrawerHeight(0);
    };
  }, []);
  const dispatch = useAppDispatch();

  const {
    all,
    selected: selectedTreeTag,
    indices: { byPlots },
  } = useAppSelector((state) => state.trees);
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
        if (!latestCensus || updatedAt > latestCensus) {
          latestCensus = updatedAt;
        }
      }
      return latestCensus;
    },
    [byPlots, all]
  );

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
              <DrawerButton onPress={beginPlotting}>Add Trees</DrawerButton>
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
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text variant={TextVariants.H2}>Tree #{selected.tag}</Text>
                    <Queue size={36}></Queue>
                    <Text variant={TextVariants.Body}>
                      Last census on{" "}
                      {dateformat(
                        selected.updatedAt,
                        'mmm dS, yyyy "at" h:MM TT'
                      )}
                    </Text>
                  </View>
                  <DrawerButton onPress={expandDrawer}>Edit</DrawerButton>
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
                  <DrawerButton
                    style={{ marginHorizontal: 12 }}
                    onPress={() => {}}
                    icon={
                      <FlagIcon
                        height={16}
                        width={16}
                        style={{ marginRight: 12 }}
                      />
                    }
                  >
                    Flag for Review
                  </DrawerButton>
                  <Ionicons name="close" size={24} onPress={minimizeDrawer} />
                </View>
              )}
            </View>

            {drawerState === "EXPANDED" && !!selected && (
              <>
                <Stack size={24}></Stack>
                <View>
                  <DataEntryForm
                    cancel={() => {
                      dispatch(locallyDeleteTree(selected.tag));
                      dispatch(deselectTree());
                      minimizeDrawer();
                    }}
                    finish={minimizeDrawer}
                    style={{ flex: 1 }}
                  />
                </View>
              </>
            )}
          </>
        )}
      </BlurView>
    </Animated.View>
  );
};

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
