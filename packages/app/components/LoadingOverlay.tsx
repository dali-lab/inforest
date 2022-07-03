import { FC, ReactNode } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Text, TextVariants } from "./Themed";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { MapOverlay } from "./MapOverlay";


interface LoadingOverlayProps {
  children?: ReactNode;
  isBackArrow?: boolean;
}

const LoadingOverlay: FC<LoadingOverlayProps> = ({ children, isBackArrow }) => {
  const navigate = useNavigation();

  return (
    <View style={styles.loadingOverlay}>
      <Text variant={TextVariants.H3} color="white">
        {children || "Loading..."}
      </Text>
      <ActivityIndicator style={{ marginTop: 16 }} size="large" color="white" />
      {
        isBackArrow && 
          <MapOverlay 
            top={32} 
            left={32}
          >
            <Ionicons
              name="ios-arrow-back"
              size={32}
              onPress={() => {
                navigate.goBack();
              }}
            />
          </MapOverlay>
      }
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
