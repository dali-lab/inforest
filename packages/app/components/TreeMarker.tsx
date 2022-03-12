import React from "react";
import { View } from "react-native";
import Color from "color";

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
        backgroundColor: selected
          ? new Color().hex(color).lighten(0.1).toString()
          : color,
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
              shadowOpacity: 0.5,
              shadowRadius: 16,
              elevation: 6,
            }
          : {}),
      }}
    ></View>
  );
};
