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
  type?: "PLAIN" | "COLOR" | "RED";
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
        styles.button,
        type === "PLAIN" && styles.plainButton,
        type === "COLOR" && styles.colorButton,
        type === "RED" && styles.redButton,
        style,
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
          style={[
            type === "PLAIN" && styles.plainText,
            (type === "COLOR" || type === "RED") && styles.colorText,
            disabled && styles.disabledText,
          ]}
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
  text: {
    fontWeight: "bold",
  },
  plainText: {
    color: "black",
  },
  colorText: {
    color: "white",
  },
  disabledText: {
    color: Colors.neutral[4],
  },
});

export default AppButton;
