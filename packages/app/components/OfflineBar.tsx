import { FC } from "react";
import { StyleSheet, View } from "react-native";
import { useIsConnected } from "react-native-offline";
import { Text } from "./Themed";
import Colors from "../constants/Colors";

const OfflineBar: FC = () => {
  const isConnected = useIsConnected();
  return !isConnected ? (
    <View style={styles.offlineBar}>
      <Text style={styles.offlineText}>
        You are currently offline. Your changes will be saved once you
        reconnect.
      </Text>
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  offlineBar: {
    backgroundColor: Colors.error,
    height: 24,
    width: "100%",
    top: 0,
    position: "absolute",
    zIndex: 3,
  },
  offlineText: {
    width: "100%",
    textAlign: "center",
    fontSize: 12,
    marginTop: 2,
    color: "white",
    position: "absolute",
    zIndex: 16,
  },
});

export default OfflineBar;
