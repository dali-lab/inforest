import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Keyboard,
  KeyboardTypeOptions,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  TextInputBase,
  View,
} from "react-native";
import { Inset, Queue, Stack } from "react-native-spacing-system";
import Colors from "../constants/Colors";
import { Text, TextVariants } from "./Themed";

interface DataFieldProps<T = string | number | boolean> {
  type:
    | "SHORT_TEXT"
    | "LONG_TEXT"
    | "INTEGER"
    | "DECIMAL"
    | "SPECIES"
    | "PHOTOS";
  label: string;
  value?: T;
  placeholder?: T;
  moreInfo?: string;
  editable?: boolean;
  onUpdate?: (newValue: T) => void;
}

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
  useEffect(() => {
    textInputRef.current?.focus();
  }, [textInputRef == null]);

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
      if (!!onUpdate) {
        switch (type) {
          case "SHORT_TEXT":
          case "LONG_TEXT":
            onUpdate(value);
          case "INTEGER": {
            const parsed = parseInt(value);
            if (parsed != NaN) {
              onUpdate(parsed);
            }
            break;
          }
          case "DECIMAL": {
            const parsed = parseFloat(value);
            if (parsed != NaN) {
              onUpdate(parsed);
            }
            break;
          }
        }
      }
    },
    [type]
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
      <Inset vertical={4}>
        {type !== "PHOTOS" && (
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
        )}
      </Inset>
    </>
  );
};

export const DataField: React.FC<View["props"] & DataFieldProps> = (props) => {
  const { type, editable = true, style } = props;
  const [editing, setEditing] = React.useState(false);
  const [renderedWidth, setRenderedWidth] = React.useState<number>();
  useEffect(() => {
    const subscription = Keyboard.addListener("keyboardWillHide", () => {
      setEditing(false);
    });
    return () => {
      subscription.remove();
    };
  });
  if (editable && type !== "PHOTOS") {
    return (
      <>
        <Pressable
          style={[style, styles.container]}
          onPress={() => setEditing(true)}
          onLayout={(e) => {
            setRenderedWidth(e.nativeEvent.layout.width);
          }}
        >
          <Content {...props} editing={false}></Content>
        </Pressable>
        <Modal
          visible={editing}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setEditing(false)}
        >
          <Pressable
            style={styles.centeredView}
            onPress={() => setEditing(false)}
          >
            <View
              style={[styles.modal, styles.container, { width: renderedWidth }]}
            >
              <Content {...props} editing={true}></Content>
            </View>
          </Pressable>
        </Modal>
      </>
    );
  } else {
    return (
      <>
        <View
          style={[style, styles.container]}
          onLayout={(e) => {
            setRenderedWidth(e.nativeEvent.layout.width);
          }}
        >
          <Content {...props} editing={false}></Content>
        </View>
      </>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    alignSelf: "center",
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
