import { ReactNode, useMemo, useState } from "react";
import { View, KeyboardTypeOptions, TextInput } from "react-native";
import Colors from "../../constants/Colors";
import { Text, TextVariants } from "../Themed";
import FieldWrapper from "./FieldWrapper";

type TextFieldProps = {
  value: string;
  setValue: (newValue: string) => void;
  prefixComponent?: ReactNode;
  textType: "SHORT_TEXT" | "LONG_TEXT" | "INTEGER" | "DECIMAL";
  suffix?: string;
  disabled?: boolean;
  placeholder?: string;
} & (
  | {
      wrapperDisabled: true;
      label: undefined;
    }
  | {
      wrapperDisabled?: false;
      label: string;
    }
);

const TextField: React.FC<TextFieldProps> = ({
  prefixComponent,
  value,
  setValue,
  textType,
  suffix,
  disabled,
  placeholder,
  wrapperDisabled,
  label,
}) => {
  const [currValue, setCurrValue] = useState<string>(value);
  const [editing, setEditing] = useState<boolean>(false);
  const keyboardType = useMemo<KeyboardTypeOptions>(() => {
    let keyboardType: KeyboardTypeOptions = "default";
    switch (textType) {
      case "INTEGER":
        keyboardType = "number-pad";
        break;
      case "DECIMAL":
        keyboardType = "decimal-pad";
        break;
    }
    return keyboardType;
  }, [textType]);

  return (
    <FieldWrapper label={label} disabled={wrapperDisabled}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {prefixComponent}
        {editing ? (
          <TextInput
            style={{
              fontFamily: "Open Sans Regular",
              height: textType === "LONG_TEXT" ? 128 : undefined,
            }}
            focusable={true}
            keyboardType={keyboardType}
            onSubmitEditing={(e) => {
              setValue(e.nativeEvent.text);
            }}
            onChange={(e) => {
              setCurrValue && setCurrValue(e.nativeEvent.text);
            }}
            multiline={textType === "LONG_TEXT"}
            returnKeyType="done"
          >
            {value}
          </TextInput>
        ) : (
          <Text
            variant={TextVariants.Body}
            color={disabled ? Colors.neutral[4] : undefined}
            style={{
              flex: 1,
              height: textType === "LONG_TEXT" ? 128 : undefined,
            }}
          >
            {value ?? placeholder}
          </Text>
        )}
        {suffix && <Text style={{ textAlign: "right" }}>{suffix}</Text>}
      </View>
    </FieldWrapper>
  );
};
export default TextField;
