import React, { FC } from "react";
import AppButton from "./AppButton";
import Modal from "./AppModal";
import { Text } from "./Themed";

interface ConfirmationModalProps {
  title: string;
  prompt: string;
  onConfirm: () => void;
  visible: boolean;
  setVisible: (newVis: boolean) => void;
  confirmMessage?: string;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
  title,
  prompt,
  onConfirm,
  visible,
  setVisible,
  confirmMessage = "Confirm",
}) => {
  return (
    <Modal title={title} visible={visible} setVisible={setVisible}>
      <Text>{prompt}</Text>
      <AppButton style={{ marginTop: 16 }} onPress={onConfirm} type="COLOR">
        {confirmMessage}
      </AppButton>
    </Modal>
  );
};

export default ConfirmationModal;
