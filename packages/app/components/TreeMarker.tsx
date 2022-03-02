import React, { CSSProperties } from "react";
import { View } from "react-native";

type TreeMarkerProps = {
  color: CSSProperties["color"];
  size: number;
};

export const TreeMarker = ({ color, size }: TreeMarkerProps) => {
  return (
    <View
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
    ></View>
  );
};
