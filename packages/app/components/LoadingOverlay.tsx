import { FC, ReactNode } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Text, TextVariants } from "./Themed";

interface LoadingOverlayProps {
  children?: ReactNode;
}

const LoadingOverlay: FC<LoadingOverlayProps> = ({ children }) => {
  return (
    <View style={styles.loadingOverlay}>
      <Text variant={TextVariants.H3} color="white">
        {children || "Loading..."}
      </Text>
      <ActivityIndicator style={{ marginTop: 16 }} size="large" color="white" />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    position: "absolute",
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.4)",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default LoadingOverlay;
