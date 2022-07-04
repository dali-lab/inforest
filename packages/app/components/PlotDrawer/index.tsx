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
  deleteTreeCensus,
  deselectTreeCensus,
  locallyCreateTreeCensus,
  locallyDeleteTreeCensus,
  locallyUpdateTreeCensus,
  updateTreeCensus,
} from "../../redux/slices/treeCensusSlice";
import { useIsConnected } from "react-native-offline";
import ConfirmationModal from "../ConfirmationModal";
import { submitPlotCensus } from "../../redux/slices/plotCensusSlice";

// Unused component
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
  "id" | "treeId" | "plotCensusId" | "authorId" | "dbh"
> = {
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
  expandDrawer: () => void;
  minimizeDrawer: () => void;
  setDrawerHeight?: (height: number) => void;
  stopPlotting?: () => void;
};

export const PlotDrawer: React.FC<PlotDrawerProps> = ({
  mode,
  zoom,
  drawerState,
  plot,
  plotCensus,
  minimizeDrawer,
  setDrawerHeight,
  stopPlotting,
}) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
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
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [submitModalOpen, setSubmitModalOpen] = useState<boolean>(false);

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

  // const computePlotLastUpdatedDate = useCallback(
  //   (plotId: string) => {
  //     const plotTrees = byPlots?.[plotId];
  //     let latestCensus: Date | undefined;
  //     plotTrees instanceof Set &&
  //       plotTrees.forEach((treeId) => {
  //         const { updatedAt } = allTrees[treeId];
  //         if (updatedAt && (!latestCensus || updatedAt > latestCensus)) {
  //           latestCensus = updatedAt;
  //         }
  //       });
  //     return latestCensus;
  //   },
  //   [byPlots, allTrees]
  // );

  const editTree = useCallback(
    (updatedFields: Partial<Tree>) => {
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
    async (updatedFields: Partial<TreeCensus>) => {
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

  const deleteCensus = useCallback(async () => {
    if (!selectedTreeCensus || !selectedTree) return;
    await dispatch(
      isConnected
        ? deleteTreeCensus(selectedTreeCensus.id)
        : locallyDeleteTreeCensus(selectedTreeCensus.id)
    );
    dispatch(deselectTree());
    // if (selectedTree?.initCensusId === selectedTreeCensus.id)
    //   await dispatch(
    //     isConnected
    //       ? deleteTree(selectedTree.id)
    //       : locallyDeleteTree(selectedTree.id)
    //   );
  }, [isConnected, selectedTree, selectedTreeCensus, dispatch]);

  const toggleFlagged = useCallback(async () => {
    if (selectedTreeCensus?.id) {
      editTreeCensus({ flagged: !selectedTreeCensus.flagged });
    }
  }, [selectedTreeCensus, editTreeCensus]);

  const addNewCensus = useCallback(async () => {
    // if (selectedTree)
    //   alert(
    //     selectedTree?.plotId ||
    //       "none" + selectedTree?.id ||
    //       "none" + plotCensus?.id ||
    //       ("none" + selectedTree?.id &&
    //         //@ts-ignore
    //         !byTreeActive?.[selectedTree.id]) ||
    //       "none"
    //   );

    if (
      !(
        selectedTree?.plotId &&
        selectedTree?.id &&
        plotCensus?.id &&
        !byTreeActive?.[selectedTree.id] &&
        currentUser
      )
    )
      return;
    const newCensus: Partial<TreeCensus> = {
      ...blankTreeCensus,
      treeId: selectedTree?.id,
      plotCensusId: plotCensus.id,
      authorId: currentUser.id,
    };
    if (isConnected) {
      await dispatch(createTreeCensus(newCensus));
    } else {
      dispatch(locallyCreateTreeCensus(newCensus));
    }
  }, [
    selectedTree,
    plotCensus,
    dispatch,
    isConnected,
    byTreeActive,
    currentUser,
  ]);
  useEffect(() => {
    addNewCensus();
  }, [addNewCensus]);
  if (drawerState === DrawerStates.Closed) {
    return null;
  }

  return selectedForest ? (
    <>
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
                      onPress={() => {
                        isConnected
                          ? setSubmitModalOpen(true)
                          : alert(
                              "You must be online to submit a plot for review."
                            );
                      }}
                      disabled={
                        plotCensus?.status !== PlotCensusStatuses.InProgress
                      }
                    >
                      Submit for review
                    </AppButton>
                  </View>
                  <Stack size={24}></Stack>
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
                      This is the {byPlots[plot.id].size + 1}th tree in the
                      plot.
                    </Text>
                  </View>
                  <AppButton
                    style={{ marginLeft: 12 }}
                    type="REDBORDER"
                    onPress={() => {
                      setDeleteModalOpen(true);
                    }}
                  >
                    Delete Census
                  </AppButton>
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
              {drawerState === "EXPANDED" && !!selectedTree && (
                <>
                  {selectedTreeCensus && (
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

      <ConfirmationModal
        title="Delete Census"
        prompt="Are you sure you would like to delete this census?"
        visible={deleteModalOpen}
        setVisible={setDeleteModalOpen}
        onConfirm={async () => {
          await deleteCensus();
          setDeleteModalOpen(false);
        }}
      />
      <ConfirmationModal
        title="Submit Plot for Review"
        prompt="Are you sure you would like to submit this plot? You will not be able to edit it after submitting."
        visible={submitModalOpen}
        setVisible={setSubmitModalOpen}
        onConfirm={async () => {
          if (!plot?.id) {
            alert("Error: no plot submitted for submitting");
            return;
          }
          await dispatch(submitPlotCensus(plot.id));
          setSubmitModalOpen(false);
          alert("Plot successfully submitted!");
          stopPlotting && stopPlotting();
        }}
      />
    </>
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
