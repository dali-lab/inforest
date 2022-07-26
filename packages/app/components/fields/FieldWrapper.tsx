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
  wrapperStyle?: ViewStyle[];
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
    <View style={[styles.wrapper, ...(wrapperStyle || [])]}>
      <View style={styles.header}>
        {label && <Text variant={TextVariants.Label}>{label}</Text>}
        <Queue size={6}></Queue>

        {
          // Add this back once hint feature is being fleshed out
          /* {noHint ? null : (
          <Ionicons
            name="ios-information-circle-outline"
            size={16}
            color={Colors.neutral[7]}
          ></Ionicons>
        )} */
        }
      </View>
      <View style={style}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default FieldWrapper;
