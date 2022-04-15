import React, { useEffect } from "react";
import { Keyboard, Modal, Pressable, StyleSheet, View } from "react-native";
import Content from "./Content";

export interface DataFieldProps<T = string | number | boolean> {
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
