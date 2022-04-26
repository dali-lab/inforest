import { Tree, TreeCensus } from "@ong-forestry/schema";
import { useCallback, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
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
  const updateDraft = useCallback(
    (updatedFields) => {
      dispatch(
        locallyUpdateTree({
          tag: selected.tag,
          updates: { ...selected, ...updatedFields },
        })
      );
    },
    [dispatch, locallyUpdateTree, selected]
  );
  return (
    <View style={[style, styles.container]}>
      <View style={{ flexDirection: "column" }}>
        <View style={styles.progressRow}>
          <FormProgress stage={stage} setStage={setStage} />
        </View>
        <View>
          {StageList[stage] == "META" && (
            <MetaDataForm selected={selected} updateDraft={updateDraft} />
          )}
          {StageList[stage] == "DATA" && (
            <DataForm selected={selected} updateDraft={updateDraft} />
          )}
          {StageList[stage] == "REVIEW" && (
            <ReviewForm selected={selected} updateDraft={updateDraft} />
          )}
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
};

interface FormProps {
  selected: Tree;
  updateDraft: (changes: Partial<Tree> & Partial<TreeCensus>) => void;
}

const MetaDataForm: React.FC<FormProps> = ({ selected, updateDraft }) => {
  return (
    <View style={styles.formContainer}>
      <View style={styles.formRow}>
        <DataField
          type={"SHORT_TEXT"}
          label="Tree Tag"
          style={{ flex: 1, marginRight: 8 }}
          value={selected.tag}
          placeholder="Enter tag here"
          moreInfo="The tree's identifying tree tag"
          onUpdate={(newValue) => {}}
          editable={false}
        />
        <DataField
          type="SELECT"
          label="Species Code"
          style={{ flex: 1, marginHorizontal: 8 }}
          value={selected.speciesCode}
          placeholder=""
          moreInfo="The code representing the tree's species"
          onUpdate={(newValue) => {}}
          editable={false}
        />
        <DataField
          type="DECIMAL"
          label="X Within Plot"
          style={{ flex: 1, marginHorizontal: 8 }}
          value={selected.plotX}
          placeholder=""
          moreInfo="The tree's x position within the plot, in meters"
          onUpdate={(newValue) => {
            updateDraft({ plotX: Number(newValue) });
          }}
          editable={true}
          suffix="m"
        />
        <DataField
          type="DECIMAL"
          label="Y Within Plot"
          style={{ flex: 1, marginLeft: 8 }}
          value={selected.plotY}
          placeholder=""
          moreInfo="The tree's y position within the plot, in meters"
          onUpdate={(newValue) => {
            updateDraft({ plotY: Number(newValue) });
          }}
          editable={true}
          suffix="m"
        />
      </View>
    </View>
  );
};

const DataForm: React.FC<FormProps> = ({ updateDraft }) => {
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
            updateDraft({ dbh: Number(newValue) });
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
      <View style={{ marginTop: 12 }}>
        <DataField
          type="PHOTOS"
          label="Upload Photos"
          moreInfo="Add photos of the tree to aid identification or provide additional info"
          onUpdate={() => {}}
        />
      </View>
      <View style={styles.formRow}>
        <DataField
          type={"LONG_TEXT"}
          label="Notes"
          value={undefined}
          placeholder="Jot down field notes here"
          moreInfo="Field notes about this tree."
          style={{ flex: 5, height: 120 }}
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
            key={title}
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
    marginTop: 12,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  navButton: {
    // width: 72,
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
