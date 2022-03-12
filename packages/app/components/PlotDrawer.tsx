import React, { useCallback, useEffect, useState } from "react";
import { Forest, Plot, Tree } from "@ong-forestry/schema";
import {
  Animated,
  Button,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  MapScreenModes,
  DrawerStates,
  DraftTreesState,
  DraftTreesAction,
} from "../constants";
import Colors from "../constants/Colors";
import useAppSelector from "../hooks/useAppSelector";
import {
  locallyDeleteTree,
  deselectTree,
  updateTree,
  locallyUpdateTree,
} from "../redux/slices/treeSlice";
import DrawerButton from "./DrawerButton";
import { Text, TextVariants } from "./Themed";
import { BlurView } from "expo-blur";
import { DataField } from "./DataField";
import useAppDispatch from "../hooks/useAppDispatch";
import { Queue, Stack } from "react-native-spacing-system";
import dateformat from "dateformat";

interface DataEntryFormProps {
  cancel: () => void;
  finish: () => void;
}

const DataEntryForm: React.FC<DataEntryFormProps & View["props"]> = ({
  cancel,
  finish,
  style,
}) => {
  const dispatch = useAppDispatch();
  const { all, selected: selectedTreeTag } = useAppSelector(
    (state) => state.trees
  );
  const selected = !!selectedTreeTag ? all[selectedTreeTag] : undefined;
  const [step, setStep] = useState(0);
  if (!selected) {
    return null;
  }
  switch (step) {
    case 0: {
      return (
        <View style={[style, sstyles.container]}>
          <View style={{ flexDirection: "row" }}>
            <DataField
              type="INTEGER"
              label="Plot #"
              value={selected.plotNumber}
              moreInfo="Plot that this tree belongs to."
              style={{ flex: 1 }}
              editable={false}
            ></DataField>
            <Queue size={12}></Queue>
            <DataField
              type="SHORT_TEXT"
              label="Tag"
              value={selected.tag}
              moreInfo="Unique tag identifier for this tree."
              style={{ flex: 1 }}
              onUpdate={(newValue) => {
                dispatch(
                  locallyUpdateTree({
                    tag: selected.tag,
                    updates: { ...selected, tag: newValue },
                  })
                );
              }}
              editable={false}
            ></DataField>
            <Queue size={12}></Queue>
            <DataField
              type="DECIMAL"
              label="Position"
              value={`${selected.plotX}m, ${selected.plotY}m`}
              moreInfo="Position in meters within the plot."
              style={{ flex: 1 }}
              editable={false}
            ></DataField>
          </View>
          <Stack size={24}></Stack>
          <View style={{ flexDirection: "row" }}>
            <DataField
              type={"DECIMAL"}
              label="DBH"
              value={selected.dbh}
              placeholder={30.0}
              moreInfo="Tree trunk diameter in centimeters at breast height."
              style={{ flex: 1 }}
              onUpdate={(newValue) => {
                dispatch(
                  locallyUpdateTree({
                    tag: selected.tag,
                    updates: { ...selected, dbh: newValue },
                  })
                );
              }}
            ></DataField>
            <Queue size={12}></Queue>
            <DataField
              type={"SHORT_TEXT"}
              label="Species code"
              value={selected.speciesCode}
              placeholder="None"
              moreInfo="Code for the tree species."
              style={{ flex: 1 }}
              onUpdate={(newValue) => {
                dispatch(
                  locallyUpdateTree({
                    tag: selected.tag,
                    updates: { ...selected, speciesCode: newValue },
                  })
                );
              }}
              editable={false}
            ></DataField>
            <Queue size={12}></Queue>
            <DataField
              type={"SHORT_TEXT"}
              label="Labels"
              value={undefined}
              placeholder="None"
              moreInfo="Characteristic labels for this tree."
              style={{ flex: 3 }}
              onUpdate={(newValue) => {
                dispatch(
                  locallyUpdateTree({
                    tag: selected.tag,
                    updates: { ...selected },
                  })
                );
              }}
              editable={false}
            ></DataField>
          </View>
          <Stack size={24}></Stack>
          <View style={{ flexDirection: "row" }}>
            <DataField
              type={"LONG_TEXT"}
              label="Notes"
              value={undefined}
              placeholder="Jot down field notes here."
              moreInfo="Field notes about this tree."
              style={{ flex: 5 }}
              onUpdate={(newValue) => {
                dispatch(
                  locallyUpdateTree({
                    tag: selected.tag,
                    updates: { ...selected },
                  })
                );
              }}
              editable={false}
            ></DataField>
          </View>
          <Stack size={24}></Stack>
          <View style={sstyles.footer}>
            {/* <DrawerButton
              onPress={() => setStep(Math.max(0, step - 1))}
              disabled
            >
              Back
            </DrawerButton> */}
            <Button
              onPress={cancel}
              title="Delete"
              color={Colors.error}
            ></Button>
            <DrawerButton
              onPress={() => {
                dispatch(updateTree(selected));
                finish();
              }}
            >
              Save
            </DrawerButton>
          </View>
        </View>
      );
    }
    case 1: {
      return null;
    }
    default:
      return null;
  }
};

const sstyles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

interface PlotDrawerProps {
  mode: MapScreenModes;
  drawerState: DrawerStates;
  plot?: Plot;
  forest?: Forest;
  setDrawerHeight: (height: number) => void;
  openVisualizationModal: () => void;
  beginPlotting: () => void;
  endPlotting: () => void;
  expandDrawer: () => void;
  minimizeDrawer: () => void;
}

export const PlotDrawer: React.FC<PlotDrawerProps> = ({
  mode,
  drawerState,
  plot,
  setDrawerHeight,
  openVisualizationModal,
  beginPlotting,
  endPlotting,
  expandDrawer,
  minimizeDrawer,
}) => {
  useEffect(() => {
    return function cleanup() {
      setDrawerHeight(0);
    };
  }, []);

  const dispatch = useAppDispatch();

  const {
    all,
    selected: selectedTreeTag,
    indices: { byPlots },
  } = useAppSelector((state) => state.trees);
  const selected = !!selectedTreeTag ? all[selectedTreeTag] : undefined;

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
    (plotNumber: string) => {
      const plotTrees = byPlots[plotNumber];
      let latestCensus: Date | undefined;
      for (let treeTag of plotTrees) {
        const { updatedAt } = all[treeTag];
        if (!latestCensus || updatedAt > latestCensus) {
          latestCensus = updatedAt;
        }
      }
      return latestCensus;
    },
    [byPlots]
  );

  if (drawerState === DrawerStates.Closed) {
    return null;
  }

  return (
    <Animated.View
      style={{ ...styles.container, ...setStyle() }}
      onLayout={(e) => {
        setDrawerHeight(e.nativeEvent.layout.height);
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
                  const lastUpdated = computePlotLastUpdatedDate(plot.number);
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
                <>
                  <Text variant={TextVariants.H2}>New tree</Text>
                  <Text variant={TextVariants.Body}>
                    This is the {byPlots[plot.number].size + 1}th tree in the
                    plot.
                  </Text>
                </>
              )}
            </View>

            {drawerState === "EXPANDED" && !!selected && (
              <>
                <Stack size={24}></Stack>
                <View style={styles.content}>
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
  content: {
    // height: 512,
  },
});
