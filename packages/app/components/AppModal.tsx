import React, { useMemo, useState } from "react";
import { View, StyleSheet, Modal, Pressable } from "react-native";
import { Text, TextVariants } from "./Themed";

export type ModalSizes = "small" | "medium" | "large";

interface ModalProps {
  modalSize?: ModalSizes;
  children?: React.ReactNode;
  title?: string;
  visible: boolean;
  setVisible: (newVis: boolean) => void;
  onClose?: () => void;
}
const AppModal: React.FC<ModalProps> = ({
  children,
  title,
  modalSize = "medium",
  visible,
  setVisible,
  onClose,
}) => {
  const modalWidth = useMemo(() => {
    if (modalSize === "small") return 200;
    if (modalSize === "medium") return 400;
    if (modalSize === "large") return 600;
  }, [modalSize]);
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => {
        setVisible(false);
        onClose && onClose();
      }}
    >
      <Pressable
        style={styles.centeredView}
        onPress={() => {
          setVisible(false);
        }}
      >
        <View style={[styles.modal, styles.container, { width: modalWidth }]}>
          {/* this pressable prevents propagation of click from centeredView */}
          <Pressable>
            <View>
              {title && (
                <View style={styles.header}>
                  <Text variant={TextVariants.H3}>{title}</Text>
                </View>
              )}
              <View style={styles.body}>{children}</View>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  body: {
    paddingHorizontal: 12,
  },
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

export default AppModal;
