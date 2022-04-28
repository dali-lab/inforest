import React, { ReactNode, useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import Colors from "../../constants/Colors";
import AppButton from "../AppButton";
import Content from "./Content";

export interface DataFieldProps<T = string | number | boolean> {
  type:
    | "SHORT_TEXT"
    | "LONG_TEXT"
    | "INTEGER"
    | "DECIMAL"
    | "SPECIES"
    | "PHOTOS"
    | "SELECT";
  label?: string;
  value?: T;
  placeholder?: T;
  moreInfo?: string;
  editable?: boolean;
  onUpdate?: (newValue: T) => void;
  suffix?: string;
  modalOnly?: boolean;
  pickerOptions?: { label: string; value: string }[];
  prefixComponent?: ReactNode;
  noLabel?: boolean;
}

export const DataField: React.FC<View["props"] & DataFieldProps> = (props) => {
  const {
    type,
    editable = true,
    style,
    value,
    onUpdate,
    modalOnly,
    pickerOptions,
  } = props;
  const [editing, setEditing] = useState(false);
  const [currValue, setCurrValue] = useState<string>("");
  const [renderedWidth, setRenderedWidth] = useState<number>();
  useEffect(() => {
    const subscription = Keyboard.addListener("keyboardWillHide", () => {
      setEditing(false);
    });
    return () => {
      subscription.remove();
    };
  }, []);
  const sortedPickerOptions = useMemo(
    () =>
      pickerOptions
        ? pickerOptions.sort((a, b) => a.label.localeCompare(b.label))
        : [],
    [pickerOptions]
  );
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
          {modalOnly ? (
            <Content
              {...props}
              value={value}
              editable={false}
              editing={false}
              type={"SHORT_TEXT"}
            ></Content>
          ) : (
            <Content
              {...props}
              editing={false}
              setCurrValue={setCurrValue}
            ></Content>
          )}
        </Pressable>
        <Modal
          visible={editing}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setEditing(false)}
        >
          <Pressable
            style={styles.centeredView}
            onPress={() => {
              setEditing(false);
            }}
          >
            <View
              style={[
                styles.modal,
                styles.container,
                { width: type !== "SELECT" ? renderedWidth : 500 },
              ]}
            >
              {/* this pressable prevents propagation of click from centeredView */}
              <Pressable>
                <Content
                  {...props}
                  editing={true}
                  pickerOptions={sortedPickerOptions}
                  currValue={currValue}
                  setCurrValue={setCurrValue}
                ></Content>
                <AppButton
                  onPress={() => {
                    setEditing(false);
                    onUpdate && currValue && onUpdate(currValue);
                  }}
                  style={{ marginTop: 12 }}
                  type="COLOR"
                >
                  Submit
                </AppButton>
              </Pressable>
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
    minWidth: 150,
  },
});
