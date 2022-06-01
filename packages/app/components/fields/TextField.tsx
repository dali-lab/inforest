import { ReactNode, useEffect, useMemo } from "react";
import { View, KeyboardTypeOptions, TextInput, Keyboard } from "react-native";
import Colors from "../../constants/Colors";
import { Text, TextVariants } from "../Themed";
import FieldWrapper from "./FieldWrapper";
import { CommonFieldProps } from "./FieldController";

export type TextFieldProps = CommonFieldProps & {
  prefixComponent?: ReactNode;
  textType: "SHORT_TEXT" | "LONG_TEXT" | "INTEGER" | "DECIMAL";
  suffix?: string;
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
  wrapperStyle,
  prefixComponent,
  value = "",
  setValue = () => {},
  textType,
  suffix,
  disabled,
  placeholder,
  wrapperDisabled,
  label,
  editing,
  setEditing = () => {},
  isModal,
}) => {
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
  useEffect(() => {
    const subscription = Keyboard.addListener("keyboardWillHide", () => {
      setEditing(false);
    });
    return () => {
      subscription.remove();
    };
  }, [setEditing]);
  return (
    <FieldWrapper
      label={label}
      disabled={wrapperDisabled}
      wrapperStyle={wrapperStyle}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {prefixComponent}
        {editing && !disabled ? (
          <TextInput
            style={[
              {
                fontFamily: "Open Sans Regular",
                height: textType === "LONG_TEXT" ? 128 : undefined,
              },
              isModal && textType != "LONG_TEXT" && { fontSize: 36 },
            ]}
            focusable={true}
            keyboardType={keyboardType}
            onSubmitEditing={(e) => {
              setValue(e.nativeEvent.text);
            }}
            onChange={(e) => {
              setValue(e.nativeEvent.text);
            }}
            multiline={textType === "LONG_TEXT"}
            returnKeyType="done"
            placeholder={placeholder}
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
              fontSize: 14,
            }}
          >
            {value && value !== "" ? value : placeholder}
          </Text>
        )}
        {suffix && (
          <Text
            style={[
              { textAlign: "right", fontSize: 16 },
              isModal && textType != "LONG_TEXT" && { fontSize: 36 },
            ]}
          >
            {suffix}
          </Text>
        )}
      </View>
    </FieldWrapper>
  );
};
export default TextField;
