import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Queue, Stack } from "react-native-spacing-system";
import { BlurView } from "expo-blur";
import dateformat from "dateformat";
import {
  Forest,
  Plot,
  PlotCensus,
  PlotCensusStatuses,
  TreeCensus,
} from "@ong-forestry/schema";
import { Ionicons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";

import {
  MapScreenModes,
  DrawerStates,
  BLUR_VIEW_INTENSITY,
  MapScreenZoomLevels,
} from "../../constants";
import useAppSelector from "../../hooks/useAppSelector";
import { locallyDeleteTree, deselectTree } from "../../redux/slices/treeSlice";
import AppButton from "../AppButton";
import { Text, TextStyles, TextVariants } from "../Themed";
import useAppDispatch from "../../hooks/useAppDispatch";
import DataEntryForm from "./DataEntryForm";
import FlagIcon from "../../assets/icons/flag-icon.svg";
import Colors from "../../constants/Colors";

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
  plotCensus: PlotCensus | undefined;
  forest?: Forest;
  expandDrawer: () => void;
  minimizeDrawer: () => void;
  beginPlotting?: () => void;
  setDrawerHeight?: (height: number) => void;
};

export const PlotDrawer: React.FC<PlotDrawerProps> = ({
  mode,
  zoom,
  drawerState,
  plot,
  plotCensus,
  forest,
  expandDrawer,
  minimizeDrawer,
  beginPlotting,
  setDrawerHeight,
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
          setDrawerHeight && setDrawerHeight(e.nativeEvent.layout.height);
        }}
      >
        <BlurView style={styles.blurContainer} intensity={BLUR_VIEW_INTENSITY}>
          {zoom === MapScreenZoomLevels.Forest && (
            <View style={{}}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text variant={TextVariants.H2}>{currentForest?.name}</Text>
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
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
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

              {drawerState === "EXPANDED" && !!selected && (
                <>
                  <View style={styles.header}>
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
                      <Ionicons
                        name="close"
                        size={24}
                        onPress={minimizeDrawer}
                      />
                    </View>
                  </View>
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
