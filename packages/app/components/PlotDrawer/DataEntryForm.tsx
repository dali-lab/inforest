import { Tree, TreeCensus, TreeLabel } from "@ong-forestry/schema";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useAppDispatch from "../../hooks/useAppDispatch";
import useAppSelector from "../../hooks/useAppSelector";
import { RootState } from "../../redux";
import { locallyUpdateTree } from "../../redux/slices/treeSlice";
import { DataField } from "../DataField";
import AppButton from "../AppButton";
import { Text, TextVariants } from "../Themed";
import FormProgress from "./FormProgress";
import Colors from "../../constants/Colors";
import TextField from "../DataField/TextField";

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
      Object.values(allSpecies).map((species) => ({
        label: species.commonName,
        value: species.code,
      })),
    [allSpecies]
  );
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
        />
        <DataField
          type="SELECT"
          label="Species Code"
          style={{ marginHorizontal: 8, width: "30%" }}
          value={selected.speciesCode}
          placeholder=""
          moreInfo="The code representing the tree's species"
          onUpdate={(newValue) => {
            updateDraft({ speciesCode: newValue.toString() });
          }}
          editable
          modalOnly
          pickerOptions={speciesOptions}
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
          editable
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
          editable
          suffix="m"
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
      Object.values(allLabels).map((label) => ({
        label: label.code,
        value: label.code,
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
        {/* <DataField
          type={"INTEGER"}
          label="DBH"
          value={selected.dbh}
          style={{ flex: 0, marginRight: 12 }}
          placeholder=""
          moreInfo="The diameter of the tree at around breast height"
          onUpdate={(newValue) => {
            updateDraft({ dbh: Number(newValue) });
          }}
          editable
        /> */}
        <DataField>
          <TextField
            label="DBH"
            textType="INTEGER"
            value={selected.dbh?.toString() || ""}
            setValue={(newValue) => {
              updateDraft({ dbh: Number(newValue) });
            }}
          />
        </DataField>
        <DataField
          type={"SELECT"}
          label="Data Codes"
          style={{ flex: 1 }}
          placeholder="Select data codes here"
          moreInfo="A series of data codes describing specific aspects of the tree"
          prefixComponent={
            <LabelPillRow
              // pills={selected?.labels?.map((label) => label.code) || []}
              pills={pills.map((label) => label.code)}
              removePill={removeLabel}
            />
          }
          onUpdate={(newValue) => {
            addLabel(newValue.toString());
          }}
          modalOnly
          pickerOptions={labelsOptions}
          editable
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
        ></DataField>
      </View>
    </View>
  );
};

interface LabelPillRowProps {
  pills: string[];
  removePill: (code: string) => void;
}

const LabelPillRow: React.FC<LabelPillRowProps> = ({ pills, removePill }) => {
  return (
    <View style={{ flexDirection: "row" }}>
      {pills.map((labelCode, i) => (
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
