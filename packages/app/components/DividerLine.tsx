import React, { FC } from "react";
import { View } from "react-native";
import Colors from "../constants/Colors";

interface DividerLineProps {
  width?: number | string;
  strokeWidth?: number;
  strokeColor?: string;
}

const DividerLine: FC<DividerLineProps> = ({
  width = "100%",
  strokeWidth = 2,
  strokeColor = Colors.neutral[6],
}) => {
  return (
    <View style={{ width, flexDirection: "column", height: strokeWidth * 4 }}>
      <View
        style={{
          width: "100%",
          height: "50%",
          borderBottomWidth: strokeWidth,
          borderBottomColor: strokeColor,
        }}
      ></View>
    </View>
  );
};

export default DividerLine;
