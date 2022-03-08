import React from "react";
import { View } from "react-native";
import ColorUtil from "color";

type TreeMarkerProps = {
  color: string;
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
        backgroundColor: selected ? ColorUtil(color).lighten(1.0).hex() : color,
        width: size,
        height: size,
        borderRadius: size / 2,
        ...(selected
          ? {
              shadowColor: "black",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 6,
            }
          : {}),
      }}
    ></View>
  );
};
