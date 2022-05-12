import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import * as utm from "utm";
import DashedLine from "react-native-dashed-line";
import { getRandomBytes } from "expo-random";
import { Plot, PlotCensus } from "@ong-forestry/schema";
import Colors from "../constants/Colors";
import { Text, TextVariants } from "./Themed";
import { DEFAULT_DBH, FOLIAGE_MAGNIFICATION } from "../constants";
import { TreeMarker } from "./TreeMarker";
import useAppSelector, {
  useTreesByDensity,
  useTreesInPlots,
} from "../hooks/useAppSelector";
import {
  deselectTree,
  selectTree,
  locallyDraftNewTree,
} from "../redux/slices/treeSlice";
import useAppDispatch from "../hooks/useAppDispatch";
import AppButton from "./AppButton";
import {
  deselectTreeCensus,
  selectTreeCensus,
} from "../redux/slices/treeCensusSlice";

const SMALL_OFFSET = 8;

interface PlottingSheetProps {
  plot: Plot;
  plotCensus: PlotCensus | undefined;
  stakeNames: string[];
  mapWidth: number;
  expandDrawer: () => void;
  minimizeDrawer: () => void;
}

const STAKE_LABEL_HEIGHT = 18 + 8;
const STAKE_LABEL_WIDTH = 36 + 16;

export const PlottingSheet: React.FC<PlottingSheetProps> = ({
  plot,
  plotCensus,
  stakeNames,
  mapWidth,
  expandDrawer,
  minimizeDrawer,
}) => {
  const sheetSize = mapWidth - (STAKE_LABEL_WIDTH + 2 * SMALL_OFFSET) * 2;
  const [markerPos, setMarkerPos] = useState<{
    x: number;
    y: number;
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
  const dispatch = useAppDispatch();
  const {
    all,
    drafts,
    selected: selectedTreeId,
  } = useAppSelector((state) => state.trees);
  const {
    indices: { byTreeActive },
  } = useAppSelector((state) => state.treeCensuses);
  const selectedTree = useMemo(
    () => (selectedTreeId && all[selectedTreeId]) || undefined,
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
    indices: { byPlotCensuses },
  } = useAppSelector((state) => state.treeCensuses);
  const inProgressCensuses = useMemo(
    () => Object.keys(byPlotCensuses),
    [byPlotCensuses]
  );
  return (
    <Pressable
      style={{ ...styles.container, width: sheetSize, height: sheetSize }}
      onTouchMove={(e) => {
        dispatch(deselectTree());
        dispatch(deselectTreeCensus());
        setMarkerPos({
          x: e.nativeEvent.locationX,
          y: e.nativeEvent.locationY,
        });
      }}
      onPress={() => {
        dispatch(deselectTree());
        dispatch(deselectTreeCensus());
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
            top: -(STAKE_LABEL_HEIGHT + SMALL_OFFSET),
            left: -(STAKE_LABEL_WIDTH + SMALL_OFFSET),
          }}
        >
          <Text variant={TextVariants.Numerical}>{stakeNames[1]}</Text>
        </View>
        <View
          style={{
            ...styles.stakeLabel,
            top: -(STAKE_LABEL_HEIGHT + SMALL_OFFSET),
            right: -(STAKE_LABEL_WIDTH + SMALL_OFFSET),
          }}
        >
          <Text variant={TextVariants.Numerical}>{stakeNames[2]}</Text>
        </View>
        <View
          style={{
            ...styles.stakeLabel,
            bottom: -(STAKE_LABEL_HEIGHT + SMALL_OFFSET),
            right: -(STAKE_LABEL_WIDTH + SMALL_OFFSET),
          }}
        >
          <Text variant={TextVariants.Numerical}>{stakeNames[3]}</Text>
        </View>
        <View
          style={{
            ...styles.stakeLabel,
            ...styles.rootStakeLabel,
            bottom: -(STAKE_LABEL_HEIGHT + SMALL_OFFSET),
            left: -(STAKE_LABEL_WIDTH + SMALL_OFFSET),
          }}
        >
          <Text variant={TextVariants.Numerical} color={Colors.neutral[1]}>
            {stakeNames[0]}
          </Text>
        </View>
      </>

      {/* markers */}
      {!!markerPos && (
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
                const { easting, northing, zoneNum, zoneLetter } =
                  utm.fromLatLon(plot.latitude, plot.longitude);
                const plotX = markerLocToMeters(
                  sheetSize - markerPos.y,
                  "HORIZONTAL"
                );
                const plotY = markerLocToMeters(markerPos.x, "VERTICAL");
                const { latitude, longitude } = utm.toLatLon(
                  easting +
                    markerLocToMeters(sheetSize - markerPos.y, "HORIZONTAL"),
                  northing - markerLocToMeters(markerPos.x, "VERTICAL"),
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
                dispatch(locallyDraftNewTree(newTree));
                setMarkerPos(undefined);
                expandDrawer();
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

      {/* trees */}
      <>
        {trees
          .filter((tree) => tree.plotId === plot.id)
          .map((tree) => {
            const isDraft = drafts.has(tree.id);
            const isCensusing = tree.id in inProgressCensuses;
            const { plotX, plotY } = tree;
            if (!!plotX && !!plotY) {
              const treePixelSize =
                (tree.censuses?.[0]?.dbh ?? DEFAULT_DBH) *
                0.01 *
                (sheetSize /
                  Math.sqrt(
                    Math.pow(plot.length, 2) + Math.pow(plot.width, 2)
                  )) *
                FOLIAGE_MAGNIFICATION;
              return (
                <Pressable
                  key={tree.id}
                  style={{
                    ...styles.tree,
                    top:
                      sheetSize -
                      plotX * (sheetSize / plot.width) -
                      treePixelSize / 2,
                    left: plotY * (sheetSize / plot.length) - treePixelSize / 2,
                  }}
                  onPress={() => {
                    setMarkerPos(undefined);
                    minimizeDrawer();
                    dispatch(selectTree(tree.id));
                    dispatch(selectTreeCensus(byTreeActive[tree.id]));
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
      <>
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
      </>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.secondary.normal,
    position: "relative",
    borderColor: "white",
    borderWidth: 2,
    overflow: "hidden",
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
