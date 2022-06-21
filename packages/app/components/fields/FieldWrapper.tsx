import { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Inset, Queue } from "react-native-spacing-system";
import { Text, TextVariants } from "../Themed";
import Colors from "../../constants/Colors";

interface FieldWrapperProps {
  children: ReactNode;
  label?: string;
  disabled?: boolean;
  wrapperStyle?: ViewStyle;
  style?: ViewStyle;
  noHint?: boolean;
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({
  children,
  label,
  disabled,
  wrapperStyle,
  style,
  noHint,
}) => {
  return disabled ? (
    <>{children}</>
  ) : (
    <View style={[styles.wrapper, wrapperStyle]}>
      <View style={styles.header}>
        {label && <Text variant={TextVariants.Label}>{label}</Text>}
        <Queue size={6}></Queue>
        {noHint ? null : (
          <Ionicons
            name="ios-information-circle-outline"
            size={16}
            color={Colors.neutral[7]}
          ></Ionicons>
        )}
      </View>
      <Inset vertical={4} horizontal={8}>
        <View style={style}>{children}</View>
      </Inset>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
  },
});

export default FieldWrapper;
