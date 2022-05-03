import React, { ReactNode, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

interface FieldModalProps {
  modalWidth?: number;
  children: ReactNode;
  visible: boolean;
  setVisible: (newVis: boolean) => void;
}

const FieldModal: React.FC<FieldModalProps> = ({
  modalWidth = 300,
  children,
  visible,
  setVisible,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setVisible(false)}
    >
      <Pressable
        style={styles.centeredView}
        onPress={() => {
          setVisible(false);
        }}
      >
        <View style={[styles.modal, styles.container, { width: modalWidth }]}>
          {/* this pressable prevents propagation of click from centeredView */}
          <Pressable>{children}</Pressable>
        </View>
      </Pressable>
    </Modal>
  );
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

export default FieldModal;
