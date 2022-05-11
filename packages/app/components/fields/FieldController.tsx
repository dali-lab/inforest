import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { Keyboard, Pressable, ViewStyle } from "react-native";
import AppButton from "../AppButton";
import FieldModal, { ModalSizes } from "./FieldModal";

export interface CommonFieldProps {
  wrapperStyle?: ViewStyle;
  value?: string;
  disabled?: boolean;
  editing?: boolean;
  setEditing?: (newEditing: boolean) => void;
  setValue?: (newValue: string) => void;
  label: string;
}

export type FieldControllerProps = {
  value: string;
  style?: ViewStyle;
  modalSize?: ModalSizes;
  editable?: boolean;
  onConfirm: (newValue: string) => void;
  formComponent: ReactElement;
  modalComponent?: ReactElement;
  modalTitle?: string;
};

export const FieldController: React.FC<FieldControllerProps> = ({
  style,
  modalSize,
  onConfirm,
  formComponent,
  modalComponent,
  value,
  modalTitle,
}) => {
  // currValue is the temporary value within the form before it is pushed to the redux store
  const [currValue, setCurrValue] = useState<string>(value);
  // editing
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    const subscription = Keyboard.addListener("keyboardWillHide", () => {
      setEditing(false);
    });
    return () => {
      subscription.remove();
    };
  }, []);
  const formField = useMemo(
    () =>
      // we use cloneElement (which is inefficient) here and in modalField in order to give the passed formComponent props
      // this is needed because we want to pass formComponent as a ReactNode (as opposed to an unrendered functional component),
      // but we also want to link formComponent to the state of FieldController
      React.cloneElement(formComponent, {
        editing,
        setEditing,
        value,
      }),
    [formComponent, editing, setEditing, value]
  );
  const modalField = useMemo(
    () =>
      React.cloneElement(modalComponent || formComponent, {
        editing,
        setEditing,
        value: currValue,
        setValue: setCurrValue,
      }),
    [
      modalComponent,
      formComponent,
      editing,
      setEditing,
      currValue,
      setCurrValue,
    ]
  );
  return (
    <>
      <Pressable style={[style]} onPress={() => setEditing(true)}>
        {formField}
      </Pressable>
      <FieldModal
        visible={editing}
        setVisible={setEditing}
        modalSize={modalSize}
        title={modalTitle}
      >
        {modalField}
        <AppButton
          onPress={() => {
            setEditing(false);
            onConfirm(currValue);
          }}
          style={{ marginTop: 12 }}
          type="COLOR"
        >
          Set
        </AppButton>
      </FieldModal>
    </>
  );
};

export default FieldController;
