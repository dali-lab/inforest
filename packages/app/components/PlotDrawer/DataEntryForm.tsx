import { useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import { Queue, Stack } from "react-native-spacing-system";
import Colors from "../../constants/Colors";
import useAppDispatch from "../../hooks/useAppDispatch";
import useAppSelector from "../../hooks/useAppSelector";
import { updateTree, locallyUpdateTree } from "../../redux/slices/treeSlice";
import { DataField } from "../DataField";
import DrawerButton from "../DrawerButton";

interface DataEntryFormProps {
  cancel: () => void;
  finish: () => void;
}

const DataEntryForm: React.FC<DataEntryFormProps & View["props"]> = ({
  cancel,
  finish,
  style,
}) => {
  const dispatch = useAppDispatch();
  const { all, selected: selectedTreeTag } = useAppSelector(
    (state) => state.trees
  );
  const selected = selectedTreeTag ? all[selectedTreeTag] : undefined;
  const [step, _setStep] = useState(0);
  if (!selected) {
    return null;
  }
  switch (step) {
    case 0: {
      return (
        <View style={[style, styles.container]}>
          <View style={{ flexDirection: "row" }}>
            <DataField
              type="INTEGER"
              label="Plot #"
              value={selected.plotNumber}
              moreInfo="Plot that this tree belongs to."
              style={{ flex: 1 }}
              editable={false}
            ></DataField>
            <Queue size={12}></Queue>
            <DataField
              type="SHORT_TEXT"
              label="Tag"
              value={selected.tag}
              moreInfo="Unique tag identifier for this tree."
              style={{ flex: 1 }}
              onUpdate={(newValue) => {
                dispatch(
                  locallyUpdateTree({
                    tag: selected.tag,
                    updates: { ...selected, tag: newValue },
                  })
                );
              }}
              editable={false}
            ></DataField>
            <Queue size={12}></Queue>
            <DataField
              type="DECIMAL"
              label="Position"
              value={`${selected.plotX}m, ${selected.plotY}m`}
              moreInfo="Position in meters within the plot."
              style={{ flex: 1 }}
              editable={false}
            ></DataField>
          </View>
          <Stack size={24}></Stack>
          <View style={{ flexDirection: "row" }}>
            <DataField
              type={"DECIMAL"}
              label="DBH"
              value={selected.dbh}
              placeholder={30.0}
              moreInfo="Tree trunk diameter in centimeters at breast height."
              style={{ flex: 1 }}
              onUpdate={(newValue) => {
                dispatch(
                  locallyUpdateTree({
                    tag: selected.tag,
                    updates: { ...selected, dbh: newValue },
                  })
                );
              }}
            ></DataField>
            <Queue size={12}></Queue>
            <DataField
              type={"SHORT_TEXT"}
              label="Species code"
              value={selected.speciesCode}
              placeholder="None"
              moreInfo="Code for the tree species."
              style={{ flex: 1 }}
              onUpdate={(newValue) => {
                dispatch(
                  locallyUpdateTree({
                    tag: selected.tag,
                    updates: { ...selected, speciesCode: newValue },
                  })
                );
              }}
              editable={false}
            ></DataField>
            <Queue size={12}></Queue>
            <DataField
              type={"SHORT_TEXT"}
              label="Labels"
              value={undefined}
              placeholder="None"
              moreInfo="Characteristic labels for this tree."
              style={{ flex: 3 }}
              onUpdate={() => {
                dispatch(
                  locallyUpdateTree({
                    tag: selected.tag,
                    updates: { ...selected },
                  })
                );
              }}
              editable={false}
            ></DataField>
          </View>
          <Stack size={24}></Stack>
          <View style={{ flexDirection: "row" }}>
            <DataField
              type={"LONG_TEXT"}
              label="Notes"
              value={undefined}
              placeholder="Jot down field notes here."
              moreInfo="Field notes about this tree."
              style={{ flex: 5 }}
              onUpdate={() => {
                dispatch(
                  locallyUpdateTree({
                    tag: selected.tag,
                    updates: { ...selected },
                  })
                );
              }}
              editable={false}
            ></DataField>
          </View>
          <Stack size={24}></Stack>
          <View style={styles.footer}>
            {/* <DrawerButton
                onPress={() => setStep(Math.max(0, step - 1))}
                disabled
              >
                Back
              </DrawerButton> */}
            <Button
              onPress={cancel}
              title="Delete"
              color={Colors.error}
            ></Button>
            <DrawerButton
              onPress={() => {
                dispatch(updateTree(selected));
                finish();
              }}
            >
              Save
            </DrawerButton>
          </View>
        </View>
      );
    }
    case 1: {
      return null;
    }
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default DataEntryForm;
