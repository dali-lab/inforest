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
import FieldModal from "./FieldModal";

export interface DataFieldProps<T = string | number | boolean> {
  editable?: boolean;
  onConfirm: () => void;
  formComponent?: ReactNode;
  children: ReactNode;
}

export const DataField: React.FC<View["props"] & DataFieldProps> = (props) => {
  const { style, onConfirm, formComponent, children } = props;
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    const subscription = Keyboard.addListener("keyboardWillHide", () => {
      setEditing(false);
    });
    return () => {
      subscription.remove();
    };
  }, []);
  return (
    <>
      <Pressable
        style={[style, styles.container]}
        onPress={() => setEditing(true)}
      >
        {formComponent || children}
      </Pressable>
      <FieldModal visible={editing} setVisible={setEditing}>
        {children}
        <AppButton
          onPress={() => {
            setEditing(false);
            onConfirm();
          }}
          style={{ marginTop: 12 }}
          type="COLOR"
        >
          Submit
        </AppButton>
      </FieldModal>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
  },
});
