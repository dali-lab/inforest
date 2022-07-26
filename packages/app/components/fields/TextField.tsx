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
  secure?: boolean;
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
  suffix = "",
  disabled,
  secure = false,
  placeholder,
  wrapperDisabled,
  label,
  editing,
  setEditing = () => {},
  isModal,
  noHint,
}) => {
  const keyboardType = useMemo<KeyboardTypeOptions>(() => {
    let keyboardType: KeyboardTypeOptions = "default";
    switch (textType) {
      case "INTEGER":
        keyboardType = "numeric";
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
      wrapperStyle={[
        wrapperStyle || {},
        !isModal ? { height: "100%", flex: 1 } : {},
      ]}
      style={
        !isModal
          ? {
              flexDirection: "column",
              flex: 1,
              justifyContent:
                textType === "LONG_TEXT" ? "flex-start" : "center",
            }
          : undefined
      }
      noHint={noHint}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <>
          {prefixComponent}
          {editing && !disabled ? (
            <TextInput
              style={[
                {
                  flexGrow: 1,
                  fontFamily: "Open Sans Regular",
                  // height: textType === "LONG_TEXT" ? 128 : undefined,
                },
                isModal && textType != "LONG_TEXT" && { fontSize: 36 },
              ]}
              focusable={true}
              secureTextEntry={secure}
              keyboardType={keyboardType}
              onSubmitEditing={(e) => {
                setValue(e.nativeEvent.text);
              }}
              onChange={(e) => {
                setValue(e.nativeEvent.text);
              }}
              multiline={textType === "LONG_TEXT"}
              returnKeyType={textType === "LONG_TEXT" ? "default" : "done"}
              placeholder={placeholder}
              autoFocus={isModal}
              autoCapitalize={"none"}
              autoCorrect={false}
            >
              {value}
            </TextInput>
          ) : (
            <Text
              variant={TextVariants.Body}
              color={value && value !== "" ? undefined : Colors.neutral[4]}
              style={{
                flex: 1,
                // height: textType === "LONG_TEXT" ? 128 : undefined,
                fontSize: 14,
              }}
            >
              {value && value !== "" ? value : placeholder || null}
            </Text>
          )}
          {suffix ? (
            <Text
              style={[
                { textAlign: "right", fontSize: 16 },
                isModal && textType != "LONG_TEXT" && { fontSize: 36 },
              ]}
            >
              {suffix}
            </Text>
          ) : null}
        </>
      </View>
    </FieldWrapper>
  );
};
export default TextField;
