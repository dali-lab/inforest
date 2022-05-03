import { useMemo, useState } from "react";
import { Picker } from "@react-native-picker/picker";

interface SelectFieldProps {
  pickerOptions: { label: string; value: string }[];
  value: string;
  setValue: (newValue: string) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({
  pickerOptions,
  value,
  setValue,
}) => {
  const [currValue, setCurrValue] = useState<string>(value);
  const sortedPickerOptions = useMemo(
    () =>
      pickerOptions
        ? pickerOptions.sort((a, b) => a.label.localeCompare(b.label))
        : [],
    [pickerOptions]
  );
  return (
    <Picker
      selectedValue={value}
      onValueChange={(itemValue, _itemIndex) => {
        setCurrValue(itemValue);
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
  );
};

export default SelectField;
