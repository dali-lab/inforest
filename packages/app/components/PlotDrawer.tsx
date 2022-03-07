import React, { useCallback, useEffect } from "react";
import { Forest, Plot, Tree } from "@ong-forestry/schema";
import { Button, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import {
  MapScreenModes,
  DrawerStates,
  DraftTreesState,
  DraftTreesAction,
} from "../constants";
import Colors from "../constants/Colors";
import useAppSelector from "../hooks/useAppSelector";
import { deleteDraftedTree } from "../redux/slices/treeSlice";
import DrawerButton from "./DrawerButton"

interface PlotDrawerProps {
  mode: MapScreenModes;
  drawerState: DrawerStates;
  plot?: Plot;
  forest?: Forest;
  setDrawerHeight: (height: number) => void;
  openVisualizationModal: ()=>void;
  beginPlotting: () => void;
  endPlotting: () => void;
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
  minimizeDrawer,
}) => {
  useEffect(() => {
    return function cleanup() {
      setDrawerHeight(0);
    };
  }, []);

  const { selected } = useAppSelector((state) => state.trees);

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

  return (
    <View
      style={{ ...styles.container, ...setStyle() }}
      onLayout={(e) =>
        setDrawerHeight(
          drawerState === "CLOSED" ? 0 : e.nativeEvent.layout.height
        )
      }
    >
      {drawerState !== "CLOSED" && mode === MapScreenModes.Select && (
        <View style={styles.header}>
          <Text>Plot #{plot?.number}</Text>
          {drawerState === "MINIMIZED" && (
            <DrawerButton onPress={beginPlotting} >Add Trees</DrawerButton>
          )}
          {/* {mode === 'EXPANDED' && (
						<Button onPress={() => {
							setMode('MINIMIZED')
							onClose()
						}} title='Back to plots'></Button>
					)} */}
        </View>
      )}
      {
        drawerState !== "CLOSED" && mode === MapScreenModes.Explore && (
          <View style={[styles.header,{justifyContent:"center"}]}>
            <DrawerButton onPress={openVisualizationModal}>Visualization Settings</DrawerButton>
          </View>
        )
      }
      {drawerState !== "CLOSED" && mode === MapScreenModes.Plot && (
        <>
          <View style={styles.header}>
            {drawerState === "MINIMIZED" && !!selected && (
              <Text>
                Tap anywhere to create a new tree in Plot #{plot?.number}
              </Text>
            )}
            {drawerState === "MINIMIZED" && !!selected && (
              <Text>
                Tree #{selected.tag} in Plot #{plot?.number}
              </Text>
            )}
            {drawerState === "EXPANDED" && !!selected && (
              <>
                <Text>New tree</Text>
                <View style={{ flexDirection: "row" }}>
                  <Button
                    onPress={() => {
                      deleteDraftedTree(selected.tag);
                      minimizeDrawer();
                    }}
                    title="Delete tree"
                    color={Colors.error}
                  ></Button>
                  <Button
                    onPress={() => {
                      minimizeDrawer();
                    }}
                    title="Save tree"
                  ></Button>
                </View>
              </>
            )}
          </View>
          <>
            {drawerState === "EXPANDED" && <View style={styles.content}></View>}
          </>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    zIndex: 2,
    width: Dimensions.get("window").width,
    padding: 24,
    backgroundColor: "rgba(255, 255, 255, 0.62)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    height: 48,
  },
  content: {
    height: 512,
  },
});
