import React from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "react-native-spacing-system";
import { Text, TextVariants } from "./Themed";
interface ModalProps {
  children?: React.ReactNode;
  title: string;
}
const Modal: React.FC<ModalProps> = ({ children, title }) => {
  return (
    <View style={styles.modal}>
      <Text variant={TextVariants.H3}>{title}</Text>
      <Stack size={12}></Stack>
      <View>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    width: 384,
    zIndex: 3,
    padding: 24,
  },
});

export default Modal;
