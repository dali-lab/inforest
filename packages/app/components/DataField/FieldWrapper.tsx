import { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Inset, Queue } from "react-native-spacing-system";
import { Text, TextVariants } from "../Themed";
import Colors from "../../constants/Colors";

interface FieldWrapperProps {
  children: ReactNode;
  label?: string;
  disabled?: boolean;
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({
  children,
  label,
  disabled,
}) => {
  return disabled ? (
    <>{children}</>
  ) : (
    <>
      <View style={styles.header}>
        {label && <Text variant={TextVariants.Label}>{label}</Text>}
        <Queue size={6}></Queue>
        <Ionicons
          name="ios-information-circle-outline"
          size={16}
          color={Colors.neutral[7]}
        ></Ionicons>
      </View>
      <Inset vertical={4} horizontal={8}>
        {children}
      </Inset>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
  },
});

export default FieldWrapper;
