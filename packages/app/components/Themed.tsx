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
  SmallLabel = "SMALL_LABEL",
  Body = "BODY",
  Numerical = "NUMERICAL",
}

export const TextStyles: Record<
  TextVariants,
  {
    fontSize: number;
    fontFamily: string;
    fontWeight?: "bold";
    color: string;
  }
> = {
  [TextVariants.H1]: {
    fontSize: 32,
    fontFamily: "Nunito Bold",
    color: Colors.neutral[8],
  },
  [TextVariants.H2]: {
    fontSize: 24,
    fontFamily: "Nunito Bold",
    color: Colors.neutral[8],
  },
  [TextVariants.H3]: {
    fontSize: 20,
    fontFamily: "Nunito SemiBold",
    color: Colors.neutral[8],
  },
  [TextVariants.Label]: {
    fontSize: 16,
    fontFamily: "Nunito SemiBold",
    color: Colors.neutral[8],
  },
  [TextVariants.SmallLabel]: {
    fontSize: 12,
    fontFamily: "Nunito SemiBold",
    color: Colors.neutral[8],
  },
  [TextVariants.Body]: {
    fontSize: 16,
    fontFamily: "Open Sans Regular",
    color: Colors.neutral[8],
  },
  [TextVariants.Numerical]: {
    fontSize: 16,
    fontFamily: "Courier New",
    color: Colors.neutral[7],
    fontWeight: "bold",
  },
};

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
    ...(TextStyles[variant] as TextStyle),
    textAlignVertical: "center",
  };

  switch (spacing) {
    case "TIGHT":
      additionalStyling.lineHeight =
        (additionalStyling.fontSize as number) * 1.33;
      break;
    case "LOOSE":
      additionalStyling.lineHeight =
        (additionalStyling.fontSize as number) * 1.5;
      break;
  }

  if (color) {
    additionalStyling.color = color;
  }
  return <DefaultText style={[additionalStyling, style]} {...otherProps} />;
}
