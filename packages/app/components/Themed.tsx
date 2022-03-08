import { CSSProperties } from "react";
import {
  StyleProp,
  Text as DefaultText,
  TextStyle,
  View as DefaultView,
} from "react-native";

import Colors from "../constants/Colors";

export enum TextVariants {
  H1 = "H1",
  H2 = "H2",
  H3 = "H3",
  Label = "LABEL",
  Body = "BODY",
  Numerical = "NUMERICAL",
}

export type TextProps = DefaultText["props"] & {
  variant?: TextVariants;
  spacing?: "NONE" | "TIGHT" | "LOOSE";
  color?: CSSProperties["color"];
};

export type ViewProps = DefaultView["props"];

export function Text({
  variant = TextVariants.Body,
  spacing,
  color,
  style,
  ...otherProps
}: TextProps) {
  const additionalStyling: StyleProp<TextStyle> = {
    textAlignVertical: "center",
  };

  switch (variant) {
    case TextVariants.H1:
      additionalStyling.fontFamily = "Nunito Bold";
      additionalStyling.fontSize = 32;
      // additionalStyling.lineHeight = 40;
      additionalStyling.color = Colors.neutral[8];
      break;
    case TextVariants.H2:
      additionalStyling.fontFamily = "Nunito Bold";
      additionalStyling.fontSize = 24;
      // additionalStyling.lineHeight = 32;
      additionalStyling.color = Colors.neutral[8];
      break;
    case TextVariants.H3:
      additionalStyling.fontFamily = "Nunito SemiBold";
      additionalStyling.fontSize = 20;
      // additionalStyling.lineHeight = 24;
      additionalStyling.color = Colors.neutral[8];
      break;
    case TextVariants.Label:
      additionalStyling.fontFamily = "Nunito SemiBold";
      additionalStyling.fontSize = 16;
      // additionalStyling.lineHeight = 24;
      additionalStyling.color = Colors.neutral[8];
      break;
    case TextVariants.Body:
      additionalStyling.fontFamily = "Open Sans Regular";
      additionalStyling.fontSize = 16;
      // additionalStyling.lineHeight = 24;
      additionalStyling.color = Colors.neutral[7];
      break;
    case TextVariants.Numerical:
      additionalStyling.fontFamily = "Courier New";
      additionalStyling.fontSize = 16;
      // additionalStyling.lineHeight = 24;
      additionalStyling.fontWeight = "bold";
      additionalStyling.color = Colors.neutral[7];
      break;
  }

  switch (spacing) {
    case "TIGHT":
      additionalStyling.lineHeight = additionalStyling.fontSize * 1.33;
      break;
    case "LOOSE":
      additionalStyling.lineHeight = additionalStyling.fontSize * 1.5;
      break;
  }

  if (color) {
    additionalStyling.color = color;
  }

  return <DefaultText style={[style, additionalStyling]} {...otherProps} />;
}
