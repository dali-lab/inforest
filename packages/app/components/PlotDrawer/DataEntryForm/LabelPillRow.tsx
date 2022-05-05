import React from "react";
import { View } from "react-native";
import { Text } from "../../Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../../constants/Colors";

interface LabelPillRowProps {
  pills: string[];
  removePill: (code: string) => void;
}

const LabelPillRow: React.FC<LabelPillRowProps> = ({ pills, removePill }) => {
  return (
    <View style={{ flexDirection: "row" }}>
      {pills.map((labelCode) => (
        <LabelPill
          key={labelCode}
          label={labelCode}
          onRemove={() => {
            removePill(labelCode);
          }}
        />
      ))}
    </View>
  );
};

interface LabelPillProps {
  label: string;
  onRemove: () => void;
}

const LabelPill: React.FC<LabelPillProps> = ({ label, onRemove }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        borderRadius: 10,
        backgroundColor: Colors.secondary.light,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignItems: "center",
        marginRight: 4,
      }}
    >
      <Text>{label}</Text>
      <Ionicons
        name="close-outline"
        size={16}
        onPress={onRemove}
        style={{ marginHorizontal: 4 }}
      />
    </View>
  );
};

export default LabelPillRow;
