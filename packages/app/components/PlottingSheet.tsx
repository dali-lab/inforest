import React, { useCallback, useState } from "react";
import { Button, Pressable, StyleSheet, View } from "react-native";
import * as utm from "utm";
import DashedLine from "react-native-dashed-line";
import Colors from "../constants/Colors";
import { Text } from "./Themed";
import { Plot, Tree } from "@ong-forestry/schema";
import { DEFAULT_DBH, FOLIAGE_MAGNIFICATION } from "../constants";
import { TreeMarker } from "./TreeMarker";
import useAppSelector, {
  useTreesByDensity,
  useTreesInPlots,
} from "../hooks/useAppSelector";
import {
  deselectTree,
  draftNewTree,
  selectTree,
} from "../redux/slices/treeSlice";
import { getRandomBytes } from "expo-random";
import useAppDispatch from "../hooks/useAppDispatch";
import { AUTHOR_ID, TRIP_ID } from "../constants/dev";

interface PlottingSheetProps {
  plot: Plot;
  stakeNames: string[];
  mapWidth: number;
  expandDrawer: () => void;
  minimizeDrawer: () => void;
}

const STAKE_LABEL_HEIGHT = 18;
const STAKE_LABEL_WIDTH = 36;

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
    (loc: number, axis: "VERTICAL" | "HORIZONTAL") => {
      return (
        Math.round(
          (axis === "VERTICAL" ? plot.length : plot.width) *
            (loc / sheetSize) *
            100
        ) / 100
      );
    },
    [sheetSize]
  );
  const dispatch = useAppDispatch();
  const { drafts, selected } = useAppSelector((state) => state.trees);
  const trees = useTreesInPlots(
    useTreesByDensity(
      useAppSelector((state) => state),
      1.0
    ),
    new Set([plot.number])
  );

  return (
    <Pressable
      style={{ ...styles.container, width: sheetSize, height: sheetSize }}
      onTouchMove={(e) => {
        if (!!selected) {
          dispatch(deselectTree());
        }
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
          <Text>{stakeNames[1]}</Text>
        </View>
        <View
          style={{
            ...styles.stakeLabel,
            top: -STAKE_LABEL_HEIGHT,
            right: -STAKE_LABEL_WIDTH,
          }}
        >
          <Text>{stakeNames[2]}</Text>
        </View>
        <View
          style={{
            ...styles.stakeLabel,
            bottom: -STAKE_LABEL_HEIGHT,
            right: -STAKE_LABEL_WIDTH,
          }}
        >
          <Text>{stakeNames[3]}</Text>
        </View>
        <View
          style={{
            ...styles.stakeLabel,
            ...styles.rootStakeLabel,
            bottom: -STAKE_LABEL_HEIGHT,
            left: -STAKE_LABEL_WIDTH,
          }}
        >
          <Text>{stakeNames[0]}</Text>
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
                const tag = getRandomBytes(8).join();
                dispatch(
                  draftNewTree({
                    tag,
                    plotNumber: plot.number,
                    plotX,
                    plotY,
                    latitude,
                    longitude,
                    tripId: TRIP_ID,
                    authorId: AUTHOR_ID,
                    photos: [],
                  } as Omit<Tree, "plot" | "trip" | "author">)
                );
                dispatch(selectTree(tag));
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
            <Text>{markerLocToMeters(markerPos.x, "HORIZONTAL")} m</Text>
          </View>
          <View style={{ ...styles.verticalLabel, left: markerPos?.x }}>
            <Text>{markerLocToMeters(markerPos.y, "VERTICAL")} m</Text>
          </View>
        </>
      )}

      {/* trees */}
      <>
        {trees
          .filter((tree) => tree.plotNumber === plot.number)
          .map((tree) => {
            const isDraft = drafts.has(tree.tag);
            const { plotX, plotY } = tree;
            if (!!plotX && !!plotY) {
              const treePixelSize =
                (tree.dbh ?? DEFAULT_DBH) *
                0.01 *
                (sheetSize /
                  Math.sqrt(
                    Math.pow(plot.length, 2) + Math.pow(plot.width, 2)
                  )) *
                FOLIAGE_MAGNIFICATION;
              return (
                <View
                  key={tree.tag}
                  style={{
                    ...styles.tree,
                    top:
                      sheetSize -
                      plotX * (sheetSize / plot.width) -
                      treePixelSize / 2,
                    left: plotY * (sheetSize / plot.length) - treePixelSize / 2,
                  }}
                >
                  <TreeMarker
                    color={isDraft ? Colors.error : Colors.primary.dark}
                    size={treePixelSize}
                    selected={selected?.tag === tree.tag}
                  />
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
  rootStakeLabel: {
    backgroundColor: Colors.neutral[7],
    color: Colors.neutral[1],
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
