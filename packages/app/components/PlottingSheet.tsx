import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import * as utm from "utm";
import DashedLine from "react-native-dashed-line";
import { getRandomBytes } from "expo-random";
import { Plot, PlotCensus } from "@ong-forestry/schema";
import Colors from "../constants/Colors";
import { Text, TextVariants } from "./Themed";
import {
  DEFAULT_DBH,
  DrawerStates,
  FOLIAGE_MAGNIFICATION,
  MapScreenModes,
} from "../constants";
import { TreeMarker } from "./TreeMarker";
import useAppSelector, {
  useTreesByDensity,
  useTreesInPlots,
} from "../hooks/useAppSelector";
import {
  deselectTree,
  selectTree,
  locallyDraftNewTree,
  createTree,
} from "../redux/slices/treeSlice";
import useAppDispatch from "../hooks/useAppDispatch";
import AppButton from "./AppButton";
import {
  deselectTreeCensus,
  selectTreeCensus,
} from "../redux/slices/treeCensusSlice";
import { useIsConnected } from "react-native-offline";
import { Ionicons } from "@expo/vector-icons";
import { Queue } from "react-native-spacing-system";

const SMALL_OFFSET = 8;
const PLOT_SHEET_MARGINS = 36;

interface PlottingSheetProps {
  mode: MapScreenModes;
  plot: Plot;
  plotCensus: PlotCensus | undefined;
  stakeNames: string[];
  mapWidth: number;
  direction?: number;
  drawerState: DrawerStates;
  expandDrawer: () => void;
  minimizeDrawer: () => void;
}

const STAKE_LABEL_HEIGHT = 18 + 8;
const STAKE_LABEL_WIDTH = 36 + 16;

const MIN_DOT_SIZE = 16;

export const PlottingSheet: React.FC<PlottingSheetProps> = ({
  mode,
  plot,
  stakeNames,
  mapWidth,
  direction = 0,
  drawerState,
  expandDrawer,
  minimizeDrawer,
}) => {
  // const isConnected = false;
  const isConnected = useIsConnected();

  const sheetSize =
    mapWidth - (STAKE_LABEL_WIDTH + 2 * SMALL_OFFSET + PLOT_SHEET_MARGINS) * 2;
  const [markerPos, setMarkerPos] = useState<{
    x: number;
    y: number;
    adjustedX: number;
    adjustedY: number;
  }>();
  const markerLocToMeters = useCallback(
    (loc: number, axis: "VERTICAL" | "HORIZONTAL") => {
      return (
        Math.round(
          (axis === "VERTICAL" ? plot.length : plot.width) *
            (loc / sheetSize) *
            100
        ) / 100
      );
    },
    [sheetSize, plot.length, plot.width]
  );
  const transformXY = useCallback(
    (absoluteX, absoluteY) => {
      const transformedX =
        direction === 0 || direction === 2 ? absoluteX : absoluteY;
      const transformedY =
        direction === 0 || direction === 2 ? absoluteY : absoluteX;
      return {
        x:
          direction === 0 || direction == 3
            ? transformedX
            : sheetSize - transformedX,
        y:
          direction === 0 || direction == 1 || direction == 4
            ? transformedY
            : sheetSize - transformedY,
      };
    },
    [sheetSize, direction]
  );

  const dispatch = useAppDispatch();
  const {
    all,
    drafts,
    selected: selectedTreeId,
  } = useAppSelector((state) => state.trees);
  const {
    selected: selectedTreeCensusId,
    indices: { byTreeActive },
  } = useAppSelector((state) => state.treeCensuses);
  const selectedTree = useMemo(
    () => (selectedTreeId ? all[selectedTreeId] : undefined),
    [all, selectedTreeId]
  );
  const trees = useTreesInPlots(
    useTreesByDensity(
      useAppSelector((state) => state),
      1.0
    ),
    new Set([plot.id])
  );
  const {
    indices: { byPlotCensus },
  } = useAppSelector((state) => state.treeCensuses);
  const inProgressCensuses = useMemo(
    () => Object.keys(byPlotCensus),
    [byPlotCensus]
  );

  const animatedPlotRotationAngle = useMemo(
    () => new Animated.Value(direction),
    [direction]
  );

  useEffect(() => {
    Animated.spring(animatedPlotRotationAngle, {
      toValue: new Animated.Value(direction),
      useNativeDriver: true,
    }).start();
  }, [direction, animatedPlotRotationAngle]);

  const rotationAnimation = useMemo(() => {
    return animatedPlotRotationAngle.interpolate({
      inputRange: [0, 4],
      outputRange: ["0deg", "360deg"],
    });
  }, [animatedPlotRotationAngle]);

  const plotNewTree = useCallback(async () => {
    if (!markerPos) return;
    const { easting, northing, zoneNum, zoneLetter } = utm.fromLatLon(
      plot.latitude,
      plot.longitude
    );
    const { adjustedX: x, adjustedY: y } = markerPos;
    const plotX = markerLocToMeters(sheetSize - y, "HORIZONTAL");
    const plotY = markerLocToMeters(x, "VERTICAL");
    const { latitude, longitude } = utm.toLatLon(
      easting + markerLocToMeters(sheetSize - y, "HORIZONTAL"),
      northing - markerLocToMeters(x, "VERTICAL"),
      zoneNum,
      zoneLetter
    );
    const tag = getRandomBytes(2).join("").substring(0, 5);
    const newTree = {
      tag,
      plotId: plot.id,
      plotX,
      plotY,
      latitude,
      longitude,
    };
    isConnected
      ? await dispatch(createTree(newTree))
      : dispatch(locallyDraftNewTree(newTree));
    setMarkerPos(undefined);
  }, [
    dispatch,
    isConnected,
    markerLocToMeters,
    markerPos,
    plot.id,
    plot.latitude,
    plot.longitude,
    sheetSize,
  ]);

  return (
    <Pressable
      style={{ ...styles.container, width: sheetSize, height: sheetSize }}
      onTouchMove={(e) => {
        if (selectedTreeId) dispatch(deselectTree());
        if (selectedTreeCensusId) dispatch(deselectTreeCensus());

        const { locationX, locationY } = e.nativeEvent;
        const { x, y } = transformXY(locationX, locationY);

        if (0 > x || x > sheetSize || 0 > y || y > sheetSize) {
          if (selectedTreeId) dispatch(deselectTree());
        } else {
          setMarkerPos({ x, y, adjustedX: locationX, adjustedY: locationY });
        }
      }}
      onPress={() => {
        if (selectedTreeId) dispatch(deselectTree());
        if (selectedTreeCensusId) dispatch(deselectTreeCensus());
      }}
      onPressIn={() => {
        setMarkerPos(undefined);
      }}
    >
      {/* stake labels */}
      <>
        <View
          style={{
            ...styles.stakeLabel,
            ...(direction === 1 && styles.rootStakeLabel),
            top: -(STAKE_LABEL_HEIGHT + SMALL_OFFSET),
            left: -(STAKE_LABEL_WIDTH + SMALL_OFFSET),
          }}
        >
          <Text
            variant={TextVariants.Numerical}
            color={direction === 1 ? Colors.neutral[1] : undefined}
          >
            {stakeNames[Math.abs(1 - direction)]}
          </Text>
        </View>
        <View
          style={{
            ...styles.stakeLabel,
            ...(direction === 2 && styles.rootStakeLabel),
            top: -(STAKE_LABEL_HEIGHT + SMALL_OFFSET),
            right: -(STAKE_LABEL_WIDTH + SMALL_OFFSET),
          }}
        >
          <Text
            variant={TextVariants.Numerical}
            color={direction === 2 ? Colors.neutral[1] : undefined}
          >
            {stakeNames[Math.abs(2 - direction)]}
          </Text>
        </View>
        <View
          style={{
            ...styles.stakeLabel,
            ...(direction === 3 && styles.rootStakeLabel),
            bottom: -(STAKE_LABEL_HEIGHT + SMALL_OFFSET),
            right: -(STAKE_LABEL_WIDTH + SMALL_OFFSET),
          }}
        >
          <Text
            variant={TextVariants.Numerical}
            color={direction === 3 ? Colors.neutral[1] : undefined}
          >
            {stakeNames[Math.abs(3 - direction)]}
          </Text>
        </View>
        <View
          style={{
            ...styles.stakeLabel,
            ...(direction === 0 && styles.rootStakeLabel),
            bottom: -(STAKE_LABEL_HEIGHT + SMALL_OFFSET),
            left: -(STAKE_LABEL_WIDTH + SMALL_OFFSET),
          }}
        >
          <Text
            variant={TextVariants.Numerical}
            color={direction === 0 ? Colors.neutral[1] : undefined}
          >
            {stakeNames[Math.abs(0 - direction)]}
          </Text>
        </View>
      </>

      {/* markers */}
      {mode === MapScreenModes.Plot && !!markerPos && (
        <>
          <View
            style={{
              ...styles.plotTree,
              left: markerPos.x + SMALL_OFFSET,
              top: markerPos.y + SMALL_OFFSET,
            }}
          >
            <AppButton
              onPress={() => {
                plotNewTree();
              }}
            >
              Plot tree
            </AppButton>
          </View>
          <View
            style={{
              ...styles.marker,
              left: markerPos.x - 2,
              top: markerPos.y - 2,
            }}
          />
          <View
            style={{
              ...styles.horizontalAxis,
              left: 0,
              top: markerPos.y - 2,
            }}
          ></View>
          <View
            style={{
              ...styles.verticalAxis,
              left: markerPos.x - 2,
              top: 0,
            }}
          ></View>
          <View
            style={{
              ...styles.horizontalLabel,
              top: markerPos?.y + SMALL_OFFSET,
            }}
          >
            <Text variant={TextVariants.Numerical}>
              {markerLocToMeters(markerPos.x, "HORIZONTAL")} m
            </Text>
          </View>
          <View
            style={{
              ...styles.verticalLabel,
              left: markerPos?.x + SMALL_OFFSET,
            }}
          >
            <Text variant={TextVariants.Numerical}>
              {markerLocToMeters(markerPos.y, "VERTICAL")} m
            </Text>
          </View>
        </>
      )}

      {selectedTree && drawerState !== DrawerStates.Expanded && (
        <Pressable
          style={{
            position: "absolute",
            top: sheetSize - selectedTree.plotX * (sheetSize / plot.width) - 2,
            left: selectedTree.plotY * (sheetSize / plot.length) - 2,
            backgroundColor: "white",
            zIndex: 1,
            padding: 12,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
          onPress={() => {
            expandDrawer();
          }}
        >
          <Text variant={TextVariants.Label}>Tree #{selectedTree.tag}</Text>
          <Queue size={8}></Queue>
          <Ionicons name="ios-pencil" size={16}></Ionicons>
        </Pressable>
      )}
      <Animated.View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: Colors.secondary.normal,
          borderColor: "white",
          borderWidth: 2,
          transform: [{ rotate: rotationAnimation }],
        }}
      >
        {/* trees */}
        <>
          {trees
            .filter((tree) => tree.plotId === plot.id)
            .map((tree) => {
              const isDraft = drafts.has(tree.id);
              const isCensusing = tree.id in inProgressCensuses;
              const { plotX, plotY } = tree;
              if (!!plotX && !!plotY) {
                const treePixelSize = Math.max(
                  (tree.censuses?.[0]?.dbh ?? DEFAULT_DBH) *
                    0.01 *
                    (sheetSize /
                      Math.sqrt(
                        Math.pow(plot.length, 2) + Math.pow(plot.width, 2)
                      )) *
                    FOLIAGE_MAGNIFICATION,
                  MIN_DOT_SIZE
                );
                return (
                  <Pressable
                    key={tree.id}
                    style={{
                      ...styles.tree,
                      top:
                        sheetSize -
                        plotX * (sheetSize / plot.width) -
                        treePixelSize / 2,
                      left:
                        plotY * (sheetSize / plot.length) - treePixelSize / 2,
                    }}
                    onPress={() => {
                      setMarkerPos(undefined);
                      minimizeDrawer();
                      dispatch(selectTree(tree.id));

                      if (byTreeActive[tree.id]) {
                        dispatch(selectTreeCensus(byTreeActive[tree.id]));
                      } else {
                        // createCensus();
                      }
                    }}
                  >
                    <TreeMarker
                      color={
                        isDraft
                          ? Colors.primary.normal
                          : isCensusing
                          ? "yellow"
                          : Colors.primary.light
                      }
                      size={treePixelSize}
                      selected={selectedTree?.id === tree.id}
                    />
                  </Pressable>
                );
              } else return null;
            })}
        </>

        {/* plot guidelines */}
        <View
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <DashedLine
            style={{
              ...styles.cross,
              width: "100%",
              bottom: sheetSize / 2,
              left: 0,
            }}
            dashLength={8}
            dashThickness={2}
            dashGap={16}
            dashColor="white"
          />
          <DashedLine
            style={{
              ...styles.cross,
              height: "100%",
              bottom: 0,
              left: sheetSize / 2,
            }}
            axis="vertical"
            dashLength={8}
            dashThickness={2}
            dashGap={16}
            dashColor="white"
          />

          <DashedLine
            style={{
              ...styles.cross,
              width: "100%",
              bottom: sheetSize * (1 / 4),
              left: 0,
            }}
            dashLength={8}
            dashThickness={2}
            dashGap={16}
            dashColor="white"
          />
          <DashedLine
            style={{
              ...styles.cross,
              height: "100%",
              bottom: 0,
              left: sheetSize * (1 / 4),
            }}
            axis="vertical"
            dashLength={8}
            dashThickness={2}
            dashGap={16}
            dashColor="white"
          />
          <DashedLine
            style={{
              ...styles.cross,
              width: "100%",
              bottom: sheetSize * (3 / 4),
              left: 0,
            }}
            dashLength={8}
            dashThickness={2}
            dashGap={16}
            dashColor="white"
          />
          <DashedLine
            style={{
              ...styles.cross,
              height: "100%",
              bottom: 0,
              left: sheetSize * (3 / 4),
            }}
            axis="vertical"
            dashLength={8}
            dashThickness={2}
            dashGap={16}
            dashColor="white"
          />

          <View
            style={{
              ...styles.x,
              transform: [{ rotate: "45deg" }],
              width: sheetSize * Math.SQRT2,
              bottom: sheetSize / 2,
              left: -((sheetSize * (Math.SQRT2 - 1)) / 2),
            }}
          ></View>
          <View
            style={{
              ...styles.x,
              transform: [{ rotate: "135deg" }],
              width: sheetSize * Math.SQRT2,
              bottom: sheetSize / 2,
              left: -((sheetSize * (Math.SQRT2 - 1)) / 2),
            }}
          ></View>

          <View
            style={{
              ...styles.x,
              transform: [{ rotate: "45deg" }],
              width: (sheetSize * Math.SQRT2) / 2,
              bottom: sheetSize * (1 / 4),
              left: -((sheetSize * (Math.SQRT2 - 1)) / 4),
            }}
          ></View>
          <View
            style={{
              ...styles.x,
              transform: [{ rotate: "45deg" }],
              width: (sheetSize * Math.SQRT2) / 2,
              bottom: sheetSize * (3 / 4),
              left: sheetSize / 2 - (sheetSize * (Math.SQRT2 - 1)) / 4,
            }}
          ></View>
          <View
            style={{
              ...styles.x,
              transform: [{ rotate: "135deg" }],
              width: (sheetSize * Math.SQRT2) / 2,
              bottom: sheetSize * (3 / 4),
              left: -((sheetSize * (Math.SQRT2 - 1)) / 4),
            }}
          ></View>
          <View
            style={{
              ...styles.x,
              transform: [{ rotate: "135deg" }],
              width: (sheetSize * Math.SQRT2) / 2,
              bottom: sheetSize * (1 / 4),
              left: sheetSize / 2 - (sheetSize * (Math.SQRT2 - 1)) / 4,
            }}
          ></View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  stakeLabel: {
    position: "absolute",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    width: STAKE_LABEL_WIDTH,
    height: STAKE_LABEL_HEIGHT,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  rootStakeLabel: {
    backgroundColor: Colors.neutral[7],
  },
  plotTree: {
    zIndex: 4,
    position: "absolute",
  },
  marker: {
    zIndex: 4,
    position: "absolute",
    width: 4,
    height: 4,
    backgroundColor: Colors.neutral[7],
  },
  horizontalAxis: {
    zIndex: 5,
    position: "absolute",
    width: "100%",
    height: 4,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  verticalAxis: {
    zIndex: 5,
    position: "absolute",
    width: 4,
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  horizontalLabel: {
    zIndex: 4,
    position: "absolute",
    left: SMALL_OFFSET,
    backgroundColor: "white",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  verticalLabel: {
    zIndex: 4,
    position: "absolute",
    top: SMALL_OFFSET,
    backgroundColor: "white",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tree: {
    zIndex: 3,
    position: "absolute",
  },
  cross: {
    zIndex: 1,
    position: "absolute",
  },
  x: {
    zIndex: 2,
    position: "absolute",
    height: 2,
    backgroundColor: "white",
  },
});
