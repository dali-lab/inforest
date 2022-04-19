import React from "react";
import { View } from "react-native";
import Colors from "../constants/Colors";

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
        backgroundColor: selected ? Colors.highlight : color,
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
