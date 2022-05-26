import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect, useMemo, useState } from "react";
import { Animated, Pressable, View } from "react-native";
import { Queue, Stack } from "react-native-spacing-system";
import { BLUR_VIEW_INTENSITY, MapScreenModes } from "../../constants";
import Colors from "../../constants/Colors";

interface ModeSwitcherProps {
  mode: MapScreenModes;
  switchMode: () => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
  mode,
  switchMode,
}) => {
  const [firstColor, setFirstColor] = useState<string>(Colors.neutral[8]);
  const [secondColor, setSecondColor] = useState<string>("white");
  const animatedSlideOffset = useMemo(
    () => new Animated.Value(mode === MapScreenModes.Explore ? 0 : 32 + 16),
    []
  );

  useEffect(() => {
    Animated.spring(animatedSlideOffset, {
      toValue: new Animated.Value(
        mode === MapScreenModes.Explore ? 0 : 32 + 16
      ),
      useNativeDriver: true,
    }).start();
  }, [mode, animatedSlideOffset]);
  animatedSlideOffset.addListener((e) => {
    if (e.value <= 5) {
      setFirstColor(Colors.neutral[8]);
    } else if (e.value >= 42) {
      setSecondColor(Colors.neutral[8]);
    } else {
      setFirstColor("white");
      setSecondColor("white");
    }
  });
  return (
    <BlurView
      style={{
        position: "relative",
      }}
      intensity={BLUR_VIEW_INTENSITY}
    >
      <Pressable
        style={{
          height: 64,
          backgroundColor: Colors.blurViewBackground,
          paddingHorizontal: 8,
          borderRadius: 16,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={switchMode}
      >
        <Animated.View
          style={{
            height: 48,
            width: 32 + 16,
            borderRadius: 16,
            backgroundColor: "white",
            position: "absolute",
            left: 8,
            transform: [{ translateX: animatedSlideOffset }],
          }}
        ></Animated.View>
        <Queue size={8}></Queue>
        <Ionicons name="ios-eye-sharp" size={32} color={firstColor} />
        <Queue size={8}></Queue>
        <Queue size={8}></Queue>
        <Ionicons name="ios-pencil" size={32} color={secondColor} />
        <Queue size={8}></Queue>
      </Pressable>
    </BlurView>
  );
};
