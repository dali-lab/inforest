import { transform } from "@babel/core";
import React, { useCallback, useReducer, useState } from "react";
import { Button, Pressable, StyleSheet, View } from "react-native";
import Draggable from "react-native-draggable";
import * as utm from "utm";
import DashedLine from "react-native-dashed-line";
import Colors from "../constants/Colors";
import { Text } from "./Themed";
import { Plot, Tree } from "@ong-forestry/schema";
import { DraftTreesAction, DraftTreesState } from "../constants";
import { TreeMarker } from "./TreeMarker";
import useAppSelector, { useTrees } from "../hooks/useAppSelector";
import { draftNewTree } from "../redux/slices/treeSlice";
import { getRandomBytes } from "expo-random";
import useAppDispatch from "../hooks/useAppDispatch";

interface PlottingSheetProps {
  plot: Plot;
  stakeNames: string[];
  mapWidth: number;
  expandDrawer: () => void;
  minimizeDrawer: () => void;
}

const STAKE_LABEL_HEIGHT = 18;
const STAKE_LABEL_WIDTH = 36;
const DEFAULT_DBH = 10;
const PLOT_SIZE = 20;

const getTreePixelSize = (dbh: number) => {
  return dbh * 2;
};

export const PlottingSheet: React.FC<PlottingSheetProps> = ({
  plot,
  stakeNames,
  mapWidth,
  expandDrawer,
  minimizeDrawer,
}) => {
  const sheetSize = mapWidth - 64 * 2;
  const [markerPos, setMarkerPos] = useState<{
    x: number;
    y: number;
  }>();
  const markerLocToMeters = useCallback(
    (loc: number) => {
      return Math.round(PLOT_SIZE * (loc / sheetSize) * 100) / 100;
    },
    [mapWidth]
  );
  const dispatch = useAppDispatch();
  const { selected } = useAppSelector((state) => state.trees);
  const trees = useTrees(
    useAppSelector((state) => state),
    { plotNumbers: new Set([plot.number]) }
  );

  return (
    <Pressable
      style={{ ...styles.container, width: sheetSize, height: sheetSize }}
      onTouchMove={(e) => {
        setMarkerPos({
          x: e.nativeEvent.locationX,
          y: e.nativeEvent.locationY,
        });
      }}
    >
      {/* stake labels */}
      <>
        <View
          style={{
            ...styles.stakeLabel,
            top: -STAKE_LABEL_HEIGHT,
            left: -STAKE_LABEL_WIDTH,
          }}
        >
          <Text>{stakeNames[0]}</Text>
        </View>
        <View
          style={{
            ...styles.stakeLabel,
            top: -STAKE_LABEL_HEIGHT,
            right: -STAKE_LABEL_WIDTH,
          }}
        >
          <Text>{stakeNames[1]}</Text>
        </View>
        <View
          style={{
            ...styles.stakeLabel,
            bottom: -STAKE_LABEL_HEIGHT,
            right: -STAKE_LABEL_WIDTH,
          }}
        >
          <Text>{stakeNames[2]}</Text>
        </View>
        <View
          style={{
            ...styles.stakeLabel,
            bottom: -STAKE_LABEL_HEIGHT,
            left: -STAKE_LABEL_WIDTH,
          }}
        >
          <Text>{stakeNames[3]}</Text>
        </View>
      </>

      {/* markers */}
      {!!markerPos && (
        <>
          <View
            style={{
              ...styles.plotTree,
              left: markerPos.x + 12,
              top: markerPos.y + 12,
            }}
          >
            <Button
              onPress={() => {
                const { easting, northing, zoneNum, zoneLetter } =
                  utm.fromLatLon(plot.latitude, plot.longitude);
                const { latitude, longitude } = utm.toLatLon(
                  easting + markerLocToMeters(markerPos.x),
                  northing - (markerLocToMeters(markerPos.y) - PLOT_SIZE),
                  zoneNum,
                  zoneLetter
                );
                dispatch(
                  draftNewTree({
                    tag: getRandomBytes(8).join(),
                    plotNumber: plot.number,
                    plotX: markerPos.x,
                    plotY: markerPos.y,
                    latitude,
                    longitude,
                    tripId: "f03c4244-55d2-4f59-b5b1-0ea595982476",
                    authorId: "24ea9f85-5352-4f69-b642-23291a27ff1e",
                    photos: [],
                  } as Omit<Tree, "plot" | "trip" | "author">)
                );
                // expandDrawer();
                setMarkerPos(undefined);
              }}
              title="Plot tree"
            ></Button>
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
          <View style={{ ...styles.horizontalLabel, top: markerPos?.y }}>
            <Text>{markerLocToMeters(markerPos.x)} m</Text>
          </View>
          <View style={{ ...styles.verticalLabel, left: markerPos?.x }}>
            <Text>{markerLocToMeters(markerPos.y)} m</Text>
          </View>
        </>
      )}

      {/* trees */}
      <>
        {trees
          .filter((tree) => tree.plotNumber === plot.number)
          .map((tree) => {
            const { plotX, plotY } = tree;
            if (!!plotX && !!plotY) {
              const treePixelSize =
                (tree.dbh ?? DEFAULT_DBH) * 0.01 * (mapWidth / PLOT_SIZE);
              return (
                <View
                  key={tree.tag}
                  style={{
                    ...styles.tree,
                    left: plotX * (mapWidth / PLOT_SIZE) - treePixelSize / 2,
                    top: plotY * (mapWidth / PLOT_SIZE) - treePixelSize / 2,
                  }}
                >
                  <TreeMarker
                    color={Colors.primary.dark}
                    size={treePixelSize}
                  ></TreeMarker>
                </View>
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
          dashThickness={4}
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
          dashThickness={4}
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
          dashThickness={4}
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
          dashThickness={4}
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
          dashThickness={4}
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
          dashThickness={4}
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
    backgroundColor: Colors.secondary.light,
    position: "relative",
  },
  stakeLabel: {
    position: "absolute",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    width: STAKE_LABEL_WIDTH,
    height: STAKE_LABEL_HEIGHT,
  },
  plotTree: {
    zIndex: 4,
    position: "absolute",
    backgroundColor: "white",
    padding: 4,
    borderRadius: 4,
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
    left: 0,
    backgroundColor: "white",
    padding: 4,
  },
  verticalLabel: {
    zIndex: 4,
    position: "absolute",
    top: 0,
    backgroundColor: "white",
    padding: 4,
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
    height: 4,
    backgroundColor: "white",
  },
});
