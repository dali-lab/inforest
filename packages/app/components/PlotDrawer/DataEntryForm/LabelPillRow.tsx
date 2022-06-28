import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "../../Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../../constants/Colors";
import { TreeCensusLabel } from "@ong-forestry/schema";

interface LabelPillRowProps {
  pills: TreeCensusLabel[];
  removePill: (code: string) => void;
}

const LabelPillRow: React.FC<LabelPillRowProps> = ({ pills, removePill }) => {
  return (
    <View style={{ flexDirection: "row" }}>
      {pills.map((label) => (
        <LabelPill
          key={label.id}
          label={label.treeLabelCode}
          onRemove={() => {
            removePill(label.id);
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
    <View style={styles.pillRow}>
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

const styles = StyleSheet.create({
  pillRow: {
    flexDirection: "row",
    borderRadius: 10,
    backgroundColor: Colors.secondary.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
    marginRight: 4,
  },
});

export default LabelPillRow;
