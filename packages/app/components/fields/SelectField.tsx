import { useMemo } from "react";
import { Picker } from "@react-native-picker/picker";
import { CommonFieldProps } from "./FieldController";
import FieldWrapper from "./FieldWrapper";

export type SelectFieldProps = CommonFieldProps & {
  pickerOptions: { label: string; value: string }[];
};

const SelectField: React.FC<SelectFieldProps> = ({
  pickerOptions,
  value,
  setValue = () => {},
  label,
}) => {
  const sortedPickerOptions = useMemo(
    () =>
      pickerOptions
        ? pickerOptions.sort((a, b) => a.label.localeCompare(b.label))
        : [],
    [pickerOptions]
  );
  return (
    <FieldWrapper label={label}>
      <Picker
        selectedValue={value === "" ? sortedPickerOptions[0].value : value}
        onValueChange={(itemValue, _itemIndex) => {
          setValue(itemValue);
        }}
      >
        {sortedPickerOptions.map(({ label, value }) => (
          <Picker.Item
            style={{ width: 600 }}
            label={label}
            value={value}
            key={value}
          />
        ))}
      </Picker>
    </FieldWrapper>
  );
};

export default SelectField;
