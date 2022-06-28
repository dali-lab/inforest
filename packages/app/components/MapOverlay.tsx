import { BlurView } from "expo-blur";
import { View } from "react-native";
import { BLUR_VIEW_INTENSITY } from "../constants";
import Colors from "../constants/Colors";

interface MapOverlayProps {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
}

export const MapOverlay: React.FC<MapOverlayProps> = ({
  top,
  left,
  bottom,
  right,
  children,
}) => {
  return (
    <View
      style={{
        position: "absolute",
        top,
        left,
        bottom,
        right,
        backgroundColor: Colors.blurViewBackground,
        borderRadius: 16,
        width: 64,
        height: 64,
        overflow: "hidden",
      }}
    >
      <BlurView
        style={{
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
        intensity={BLUR_VIEW_INTENSITY}
      >
        {children}
      </BlurView>
    </View>
  );
};
