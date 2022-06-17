import React, { ReactNode } from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
  View,
} from "react-native";
import { Queue } from "react-native-spacing-system";
import Colors from "../constants/Colors";
import { Text, TextVariants } from "./Themed";

interface AppButtonProps {
  children: React.ReactNode;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: ReactNode;
  type?: "PLAIN" | "COLOR" | "RED" | "REDBORDER";
}

const AppButton: React.FC<AppButtonProps> = ({
  children,
  onPress,
  disabled = false,
  style,
  icon,
  type = "PLAIN",
}) => {
  return (
    <Pressable
      style={[
        style,
        styles.button,
        ...(!disabled
          ? [
              type === "PLAIN" && styles.plainButton,
              type === "COLOR" && styles.colorButton,
              type === "RED" && styles.redButton,
              type === "REDBORDER" && styles.redBorderButton,
            ]
          : [styles.disabledButton]),
      ]}
      onPress={!disabled ? onPress : undefined}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {icon && (
          <>
            {icon}
            <Queue size={8}></Queue>
          </>
        )}
        <Text
          variant={TextVariants.Label}
          color={
            disabled
              ? Colors.neutral[4]
              : ["PLAIN", "REDBORDER"].includes(type)
              ? "black"
              : "white"
          }
        >
          {children}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  plainButton: {
    backgroundColor: "white",
  },
  colorButton: {
    backgroundColor: Colors.secondary.dark,
  },
  redButton: {
    backgroundColor: Colors.error,
  },
  redBorderButton: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderColor: Colors.error,
    borderWidth: 2,
  },
  disabledButton: {
    backgroundColor: Colors.neutral[1],
  },
  text: {
    fontWeight: "bold",
  },
  plainText: {
    color: "black",
  },
  colorText: {
    color: "white",
  },
});

export default AppButton;
