import React, { CSSProperties } from "react";
import { View } from "react-native";

type TreeMarkerProps = {
  color: CSSProperties["color"];
  size: number;
  selected?: boolean;
};

export const TreeMarker = ({
  color,
  size,
  selected = false,
}: TreeMarkerProps) => {
  return (
    <View
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        borderRadius: size / 2,
        ...(selected
          ? { borderWidth: 2, borderColor: color, borderStyle: "dotted" }
          : {}),
      }}
    ></View>
  );
};
