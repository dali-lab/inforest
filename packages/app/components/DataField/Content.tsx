import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Inset, Queue } from "react-native-spacing-system";
import Colors from "../../constants/Colors";
import { Text, TextVariants } from "../Themed";
import { DataFieldProps } from "./index";

type ContentProps = DataFieldProps & { editing: boolean };
const Content: React.FC<ContentProps> = ({
  type,
  label,
  value,
  placeholder,
  editable = true,
  onUpdate,
  editing,
}) => {
  const textInputRef = useRef<TextInput>(null);
  const textInputNull = useMemo(() => textInputRef == null, [textInputRef]);
  useEffect(() => {
    textInputRef.current?.focus();
  }, [textInputNull]);

  let keyboardType: KeyboardTypeOptions = "default";
  switch (type) {
    case "INTEGER":
      keyboardType = "number-pad";
      break;
    case "DECIMAL":
      keyboardType = "decimal-pad";
      break;
  }

  const onSubmitEditing = useCallback(
    (value: string) => {
      if (onUpdate) {
        switch (type) {
          case "SHORT_TEXT":
          case "LONG_TEXT":
            onUpdate(value);
            break;
          case "INTEGER": {
            const parsed = parseInt(value);
            if (!isNaN(parsed)) {
              onUpdate(parsed);
            }
            break;
          }
          case "DECIMAL": {
            const parsed = parseFloat(value);
            if (!isNaN(parsed)) {
              onUpdate(parsed);
            }
            break;
          }
        }
      }
    },
    [type, onUpdate]
  );

  return (
    <>
      <View style={styles.header}>
        <Text variant={TextVariants.Label}>{label}</Text>
        <Queue size={6}></Queue>
        <Ionicons
          name="ios-information-circle-outline"
          size={16}
          color={Colors.neutral[7]}
        ></Ionicons>
      </View>
      <Inset vertical={4} horizontal={8}>
        {type !== "PHOTOS" ? (
          <>
            {editing ? (
              <TextInput
                ref={textInputRef}
                style={{
                  fontFamily:
                    type === "DECIMAL" || type === "INTEGER"
                      ? "Courier New"
                      : "Open Sans Regular",
                  height: type === "LONG_TEXT" ? 128 : undefined,
                }}
                focusable={true}
                keyboardType={keyboardType}
                onSubmitEditing={(e) => {
                  onSubmitEditing(e.nativeEvent.text);
                }}
                multiline={type === "LONG_TEXT"}
                returnKeyType="done"
              >
                {value}
              </TextInput>
            ) : (
              <Text
                variant={
                  type === "DECIMAL" || type === "INTEGER"
                    ? TextVariants.Numerical
                    : TextVariants.Body
                }
                color={editable ? undefined : Colors.neutral[4]}
                style={{ height: type === "LONG_TEXT" ? 128 : undefined }}
              >
                {value ?? placeholder}
              </Text>
            )}
          </>
        ) : (
          <View style={styles.photoInputRow}>
            <PhotoInput title="Bark" type="BARK" />
            <PhotoInput title="Leaf" type="LEAF" />
            <PhotoInput title="Full" type="FULL" />
            <PhotoInput title="Other" type="OTHER" />
          </View>
        )}
      </Inset>
    </>
  );
};

interface PhotoInputProps {
  title: string;
  type: string;
}

const PhotoInput: React.FC<PhotoInputProps> = ({ title, type }) => {
  return (
    <View style={styles.photoInputWrapper}>
      <Pressable style={styles.photoInput}>
        <Ionicons name="cloud-upload-outline" size={28} color="#FFFFFF" />
        <Text variant={TextVariants.Label} color="white">
          Tap to Upload
        </Text>
      </Pressable>
      <Text variant={TextVariants.Label}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
  },
  photoInputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  photoInputWrapper: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  photoInput: {
    backgroundColor: "#5F6D64",
    width: 160,
    height: 120,
    borderRadius: 10,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
});

export default Content;
