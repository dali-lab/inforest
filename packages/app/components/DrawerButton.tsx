import React from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import Colors from "../constants/Colors";
import { Text, TextVariants } from "./Themed";

interface DrawerButtonProps {
  children: React.ReactNode;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const DrawerButton: React.FC<DrawerButtonProps> = ({
  children,
  onPress,
  disabled = false,
  style,
}) => {
  return (
    <Pressable
      style={[style, styles.button]}
      onPress={!disabled ? onPress : undefined}
    >
      <Text
        variant={TextVariants.Label}
        color={disabled ? Colors.neutral[4] : undefined}
      >
        {children}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "white",
    borderRadius: 11,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  text: {
    fontWeight: "bold",
  },
});

export default DrawerButton;
