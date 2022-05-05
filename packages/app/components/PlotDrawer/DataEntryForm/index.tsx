import { Tree, TreeCensus, TreeLabel } from "@ong-forestry/schema";
import { useCallback, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import useAppDispatch from "../../../hooks/useAppDispatch";
import useAppSelector from "../../../hooks/useAppSelector";
import { RootState } from "../../../redux";
import { locallyUpdateTree } from "../../../redux/slices/treeSlice";
import AppButton from "../../AppButton";
import { Text, TextVariants } from "../../Themed";
import FormProgress from "../FormProgress";
import TextField from "../../fields/TextField";
import FieldController from "../../fields/FieldController";
import SelectField from "../../fields/SelectField";
import PhotoField from "../../fields/PhotoField";
import LabelPillRow from "./LabelPillRow";

export type FormStages = "META" | "DATA" | "REVIEW";

export const StageList: FormStages[] = ["META", "DATA", "REVIEW"];

interface DataEntryFormProps {
  cancel: () => void;
  finish: () => void;
}

const DataEntryForm: React.FC<DataEntryFormProps & View["props"]> = ({
  finish,
  style,
}) => {
  const dispatch = useAppDispatch();
  const { all, selected: selectedTreeTag } = useAppSelector(
    (state) => state.trees
  );
  const selected = selectedTreeTag ? all[selectedTreeTag] : undefined;
  const [stage, setStage] = useState<number>(0);

  const updateDraft = useCallback(
    (updatedFields) => {
      selected &&
        dispatch(
          locallyUpdateTree({
            tag: selected.tag,
            updates: { ...selected, ...updatedFields },
          })
        );
    },
    [dispatch, selected]
  );
  if (!selected) {
    return null;
  }
  return (
    <>
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
              <AppButton
                onPress={() => {
                  setStage((prevStage) => prevStage - 1);
                }}
                style={[styles.navButton, { marginRight: "auto" }]}
              >
                {stage == StageList.length - 1 ? "Continue Editing" : "Back"}
              </AppButton>
            )}
            {stage <= StageList.length - 2 && (
              <AppButton
                onPress={() => {
                  setStage((prevStage) => prevStage + 1);
                }}
                style={[styles.navButton, { marginLeft: "auto" }]}
              >
                Next
              </AppButton>
            )}
            {stage == StageList.length - 1 && (
              <AppButton
                onPress={finish}
                style={[styles.navButton, { marginLeft: "auto" }]}
              >
                Save
              </AppButton>
            )}
          </View>
        </View>
      </View>
    </>
  );
};

interface FormProps {
  selected: Tree & Partial<TreeCensus>;
  updateDraft: (changes: Partial<Tree> & Partial<TreeCensus>) => void;
}

const MetaDataForm: React.FC<FormProps> = ({ selected, updateDraft }) => {
  const { all: allSpecies } = useAppSelector(
    (state: RootState) => state.treeSpecies
  );
  const speciesOptions = useMemo(
    () =>
      Object.values(allSpecies).map(({ name, genus, code }) => ({
        label: `${genus} ${name}`,
        value: code,
      })),
    [allSpecies]
  );
  return (
    <View style={styles.formContainer}>
      <View style={styles.formRow}>
        <FieldController
          value={selected?.tag || "0"}
          style={{ marginRight: 12 }}
          onConfirm={async (newValue) => {
            // updateDraft({ tag: newValue });
          }}
          formComponent={<TextField label="Tree Tag" textType="SHORT_TEXT" />}
        />
        <FieldController
          value={selected?.speciesCode || ""}
          onConfirm={(newValue) => {
            updateDraft({ speciesCode: newValue });
          }}
          style={{ flex: 1, marginRight: 12 }}
          formComponent={
            <TextField
              label="Species Code"
              textType="SHORT_TEXT"
              placeholder="Select code here"
              disabled
            />
          }
          modalComponent={
            <SelectField label="Tree Species" pickerOptions={speciesOptions} />
          }
        />
        <FieldController
          value={selected?.plotX?.toString() || "0"}
          style={{ marginRight: 12 }}
          onConfirm={(newValue) => {
            updateDraft({ plotX: Number(newValue) });
          }}
          formComponent={
            <TextField label="X Within Plot" textType="DECIMAL" suffix="m" />
          }
        />
        <FieldController
          value={selected?.plotY?.toString() || "0"}
          onConfirm={(newValue) => {
            updateDraft({ plotY: Number(newValue) });
          }}
          formComponent={
            <TextField label="Y Within Plot" textType="DECIMAL" suffix="m" />
          }
        />
      </View>
    </View>
  );
};

const DataForm: React.FC<FormProps> = ({ updateDraft, selected }) => {
  const { all: allLabels } = useAppSelector(
    (state: RootState) => state.treeLabels
  );
  const [pills, setPills] = useState<TreeLabel[]>([]);
  const labelsOptions = useMemo(
    () =>
      Object.values(allLabels).map(({ code, description }) => ({
        label: `${code} - ${description}`,
        value: code,
      })),
    [allLabels]
  );
  const addLabel = useCallback(
    (code: string) => {
      if (!(code in pills.map((label) => label.code)))
        setPills((prev) => [...prev, allLabels[code]]);

      // if (
      //   selected?.labels &&
      //   !(code in selected?.labels?.map((label) => label.code))
      // )
      //   updateDraft({ labels: [...(selected?.labels || []), allLabels[code]] });
    },
    [updateDraft, selected, allLabels, pills, setPills]
  );
  const removeLabel = useCallback(
    (code: string) => {
      setPills((prev) => prev.filter((label) => label.code !== code));
      // updateDraft({
      //   labels: selected?.labels?.filter((label) => label.code !== code) || [],
      // });
    },
    [updateDraft, selected, pills, setPills]
  );
  return (
    <View style={styles.formContainer}>
      <View style={styles.formRow}>
        <FieldController
          value={selected?.dbh?.toString() || "0"}
          onConfirm={(newValue) => {
            updateDraft({ dbh: Number(newValue) });
          }}
          formComponent={
            <TextField label="DBH" textType="INTEGER" suffix="cm" />
          }
        />
        <FieldController
          value={""}
          style={{ marginLeft: 12, flex: 1 }}
          onConfirm={(newValue) => {
            addLabel(newValue.toString());
          }}
          modalSize="large"
          formComponent={
            <TextField
              label="Data Codes"
              textType="SHORT_TEXT"
              placeholder="Insert labels for the tree"
              disabled
              prefixComponent={
                <LabelPillRow
                  // pills={selected?.labels?.map((label) => label.code) || []}
                  pills={pills.map((label) => label.code)}
                  removePill={removeLabel}
                />
              }
            />
          }
          modalComponent={
            <SelectField label="Tree Labels" pickerOptions={labelsOptions} />
          }
        />
      </View>
      <View style={{ marginTop: 12 }}>
        <PhotoField onUpdate={() => {}} />
      </View>
      <View style={styles.formRow}>
        <FieldController
          value={""}
          onConfirm={() => {}}
          style={{ flex: 1 }}
          formComponent={<TextField label="Notes" textType="LONG_TEXT" />}
        />
      </View>
    </View>
  );
};

const ReviewableFieldMap: { [key in keyof (Tree & TreeCensus)]?: string } = {
  tag: "Tree Tag Number",
  speciesCode: "Species Code",
  plotX: "X coordinate within plot (meters)",
  plotY: "Y coordinate within plot (meters)",
  dbh: "DBH",
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
            value={selected[field]?.toString() || "Not set"}
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
