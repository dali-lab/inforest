import { Tree } from "@ong-forestry/schema";
import { useState } from "react";
import { View, Button, StyleSheet, ScrollView } from "react-native";
import { Queue, Stack } from "react-native-spacing-system";
import Colors from "../../constants/Colors";
import useAppDispatch from "../../hooks/useAppDispatch";
import useAppSelector from "../../hooks/useAppSelector";
import { updateTree, locallyUpdateTree } from "../../redux/slices/treeSlice";
import { DataField } from "../DataField";
import DrawerButton from "../DrawerButton";
import { Text, TextVariants } from "../Themed";
import FormProgress from "./FormProgress";

//TODO: solidify these
export type FormStages = "META" | "DATA" | "REVIEW";

export const StageList: FormStages[] = ["META", "DATA", "REVIEW"];

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
  const [stage, setStage] = useState<number>(0);
  if (!selected) {
    return null;
  }
  return (
    <View style={[style, styles.container]}>
      <View style={{ flexDirection: "column" }}>
        <View style={styles.progressRow}>
          <FormProgress stage={stage} setStage={setStage} />
        </View>
        <View>
          {StageList[stage] == "META" && <MetaDataForm selected={selected} />}
          {StageList[stage] == "DATA" && <DataForm />}
          {StageList[stage] == "REVIEW" && <ReviewForm selected={selected} />}
        </View>
        <View style={styles.formRow}>
          {stage !== 0 && (
            <DrawerButton
              onPress={() => {
                setStage((prevStage) => prevStage - 1);
              }}
              style={[styles.navButton, { marginRight: "auto" }]}
            >
              {stage == StageList.length - 1 ? "Continue Editing" : "Back"}
            </DrawerButton>
          )}
          {stage <= StageList.length - 2 && (
            <DrawerButton
              onPress={() => {
                setStage((prevStage) => prevStage + 1);
              }}
              style={[styles.navButton, { marginLeft: "auto" }]}
            >
              Next
            </DrawerButton>
          )}
          {stage == StageList.length - 1 && (
            <DrawerButton
              onPress={() => {}}
              style={[styles.navButton, { marginLeft: "auto" }]}
            >
              Save
            </DrawerButton>
          )}
        </View>
      </View>
    </View>
  );
  //   switch (stage) {
  //     case 0: {
  //       return (
  //         <View style={[style, styles.container]}>
  //           <View style={{ flexDirection: "row" }}>
  //             <DataField
  //               type="INTEGER"
  //               label="Plot #"
  //               value={selected.plotNumber}
  //               moreInfo="Plot that this tree belongs to."
  //               style={{ flex: 1 }}
  //               editable={false}
  //             ></DataField>
  //             <Queue size={12}></Queue>
  //             <DataField
  //               type="SHORT_TEXT"
  //               label="Tag"
  //               value={selected.tag}
  //               moreInfo="Unique tag identifier for this tree."
  //               style={{ flex: 1 }}
  //               onUpdate={(newValue) => {
  //                 dispatch(
  //                   locallyUpdateTree({
  //                     tag: selected.tag,
  //                     updates: { ...selected, tag: newValue },
  //                   })
  //                 );
  //               }}
  //               editable={false}
  //             ></DataField>
  //             <Queue size={12}></Queue>
  //             <DataField
  //               type="DECIMAL"
  //               label="Position"
  //               value={`${selected.plotX}m, ${selected.plotY}m`}
  //               moreInfo="Position in meters within the plot."
  //               style={{ flex: 1 }}
  //               editable={false}
  //             ></DataField>
  //           </View>
  //           <Stack size={24}></Stack>
  //           <View style={{ flexDirection: "row" }}>
  //             <DataField
  //               type={"DECIMAL"}
  //               label="DBH"
  //               value={selected.dbh}
  //               placeholder={30.0}
  //               moreInfo="Tree trunk diameter in centimeters at breast height."
  //               style={{ flex: 1 }}
  //               onUpdate={(newValue) => {
  //                 dispatch(
  //                   locallyUpdateTree({
  //                     tag: selected.tag,
  //                     updates: { ...selected, dbh: newValue },
  //                   })
  //                 );
  //               }}
  //             ></DataField>
  //             <Queue size={12}></Queue>
  //             <DataField
  //               type={"SHORT_TEXT"}
  //               label="Species code"
  //               value={selected.speciesCode}
  //               placeholder="None"
  //               moreInfo="Code for the tree species."
  //               style={{ flex: 1 }}
  //               onUpdate={(newValue) => {
  //                 dispatch(
  //                   locallyUpdateTree({
  //                     tag: selected.tag,
  //                     updates: { ...selected, speciesCode: newValue },
  //                   })
  //                 );
  //               }}
  //               editable={false}
  //             ></DataField>
  //             <Queue size={12}></Queue>
  //             <DataField
  //               type={"SHORT_TEXT"}
  //               label="Labels"
  //               value={undefined}
  //               placeholder="None"
  //               moreInfo="Characteristic labels for this tree."
  //               style={{ flex: 3 }}
  //               onUpdate={() => {
  //                 dispatch(
  //                   locallyUpdateTree({
  //                     tag: selected.tag,
  //                     updates: { ...selected },
  //                   })
  //                 );
  //               }}
  //               editable={false}
  //             ></DataField>
  //           </View>
  //           <Stack size={24}></Stack>
  //           <View style={{ flexDirection: "row" }}>
  //             <DataField
  //               type={"LONG_TEXT"}
  //               label="Notes"
  //               value={undefined}
  //               placeholder="Jot down field notes here."
  //               moreInfo="Field notes about this tree."
  //               style={{ flex: 5 }}
  //               onUpdate={() => {
  //                 dispatch(
  //                   locallyUpdateTree({
  //                     tag: selected.tag,
  //                     updates: { ...selected },
  //                   })
  //                 );
  //               }}
  //               editable={false}
  //             ></DataField>
  //           </View>
  //           <Stack size={24}></Stack>
  //           <View style={styles.footer}>
  //             {/* <DrawerButton
  //                 onPress={() => setStep(Math.max(0, stage - 1))}
  //                 disabled
  //               >
  //                 Back
  //               </DrawerButton> */}
  //             <Button
  //               onPress={cancel}
  //               title="Delete"
  //               color={Colors.error}
  //             ></Button>
  //             <DrawerButton
  //               onPress={() => {
  //                 dispatch(updateTree(selected));
  //                 finish();
  //               }}
  //             >
  //               Save
  //             </DrawerButton>
  //           </View>
  //         </View>
  //       );
  //     }
  //     case 1: {
  //       return null;
  //     }
  //     default:
  //       return null;
  //   }
};

interface FormProps {
  selected: Tree;
}

const MetaDataForm: React.FC<FormProps> = ({ selected }) => {
  return (
    <View style={styles.formContainer}>
      <View style={styles.formRow}>
        <DataField
          type={"INTEGER"}
          label="Plot Number"
          value={"ADD PLOT NUMBER HERE"}
          style={{ flex: 1 }}
          placeholder=""
          moreInfo="The number of the plot this tree belongs to"
          onUpdate={() => {}}
          editable={false}
        />
        <DataField
          type={"SHORT_TEXT"}
          label="Tree Tag"
          value={undefined}
          style={{ flex: 1, marginHorizontal: 12 }}
          placeholder="Enter tag here"
          moreInfo="The tree's identifying tree tag"
          onUpdate={() => {}}
          editable={true}
        />
        <DataField
          type={"SHORT_TEXT"}
          label="Relative Coordinates"
          value={`${selected.plotX}m, ${selected.plotY}m`}
          style={{ flex: 2 }}
          placeholder=""
          moreInfo="The tree's coordinates (in meters) in relation to the edge of the plot."
          onUpdate={() => {}}
          editable={false}
        />
      </View>
      <View>
        <DataField
          type={"PHOTOS"}
          label="Upload Photos"
          value={undefined}
          style={{ height: 240 }}
          placeholder=""
          moreInfo="Upload photos of relevant parts of the tree to aid identification."
          onUpdate={() => {}}
          editable={true}
        />
      </View>
    </View>
  );
};

const DataForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { all, selected: selectedTreeTag } = useAppSelector(
    (state) => state.trees
  );
  const selected = selectedTreeTag ? all[selectedTreeTag] : undefined;
  if (!selected) {
    return null;
  }
  return (
    <View style={styles.formContainer}>
      <View style={styles.formRow}>
        <DataField
          type={"INTEGER"}
          label="DBH"
          value={0}
          style={{ flex: 0, marginRight: 12 }}
          placeholder=""
          moreInfo="The diameter of the tree at around breast height"
          onUpdate={(newValue) => {
            dispatch(
              locallyUpdateTree({
                tag: selected.tag,
                updates: { ...selected, dbh: newValue },
              })
            );
          }}
          editable={true}
        />
        <DataField
          type={"SHORT_TEXT"}
          label="Data Codes"
          value={undefined}
          style={{ flex: 1 }}
          placeholder="Select data codes here"
          moreInfo="A series of data codes describing specific aspects of the tree"
          onUpdate={() => {}}
          editable={true}
        />
      </View>
      <View>
        <DataField
          type={"LONG_TEXT"}
          label="Notes"
          value={undefined}
          placeholder="Jot down field notes here"
          moreInfo="Field notes about this tree."
          style={{ flex: 5, height: 240 }}
          onUpdate={() => {}}
          editable={false}
        ></DataField>
      </View>
    </View>
  );
};

const ReviewableFieldMap: { [key in keyof Tree]?: string } = {
  // plotNumber: "Plot Number",
  tag: "Tree Tag Number",
  plotX: "X coordinate within plot (meters)",
  plotY: "Y coordinate within plot (meters)",
  // dbh: "DBH",
};
const ReviewableFieldMapEntries = Object.entries(ReviewableFieldMap) as [
  keyof Tree,
  string
][];

const ReviewForm: React.FC<FormProps> = ({ selected }) => {
  return (
    <View style={styles.formContainer}>
      <ScrollView
        style={styles.reviewScroll}
        showsVerticalScrollIndicator={true}
        persistentScrollbar={true}
      >
        {ReviewableFieldMapEntries.map(([field, title]) => (
          <ReviewEntry
            field={title}
            value={selected[field]?.toString() || ""}
          />
        ))}
      </ScrollView>
    </View>
  );
};

interface ReviewEntryProps {
  field: string;
  value: string;
}

const ReviewEntry: React.FC<ReviewEntryProps> = ({ field, value }) => {
  return (
    <View style={{ flexDirection: "column", marginBottom: 24 }}>
      <Text
        variant={TextVariants.H2}
        style={{ marginBottom: 10, fontSize: 14 }}
      >
        {field}
      </Text>
      <Text variant={TextVariants.Body} style={{ fontSize: 24 }}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
  },
  formContainer: {
    flexDirection: "column",
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  navButton: {
    width: 72,
    flexGrow: 0,
  },
  reviewScroll: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
});

export default DataEntryForm;
