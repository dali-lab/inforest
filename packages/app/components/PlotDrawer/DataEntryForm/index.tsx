import { Tree, TreeCensus } from "@ong-forestry/schema";
import { useCallback, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import useAppDispatch from "../../../hooks/useAppDispatch";
import useAppSelector from "../../../hooks/useAppSelector";
import { RootState } from "../../../redux";
import AppButton from "../../AppButton";
import { Text, TextVariants } from "../../Themed";
import FormProgress from "../FormProgress";
import TextField from "../../fields/TextField";
import FieldController from "../../fields/FieldController";
import SelectField from "../../fields/SelectField";
import PhotoField from "../../fields/PhotoField";
import LabelPillRow from "./LabelPillRow";
import { useIsConnected } from "react-native-offline";
import {
  createTreeCensusLabel,
  deleteTreeCensusLabel,
  locallyCreateTreeCensusLabel,
  locallyDeleteTreeCensusLabel,
} from "../../../redux/slices/treeCensusLabelSlice";

export type FormStages = "META" | "DATA" | "REVIEW";

export const StageList: FormStages[] = ["META", "DATA", "REVIEW"];

interface DataEntryFormProps {
  selectedTree: Tree;
  selectedTreeCensus: TreeCensus;
  cancel: () => void;
  finish: (newTreeCensus: TreeCensus) => void;
  editTree: (updated: Partial<Tree>) => void;
  editTreeCensus: (updated: Partial<TreeCensus>) => void;
}

const DataEntryForm: React.FC<DataEntryFormProps & View["props"]> = ({
  finish,
  style,
  selectedTree,
  selectedTreeCensus,
  editTree,
  editTreeCensus,
}) => {
  const [stage, setStage] = useState<number>(0);

  if (!selectedTree || !selectedTreeCensus) {
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
              <MetaDataForm selectedTree={selectedTree} editTree={editTree} />
            )}
            {StageList[stage] == "DATA" && (
              <DataForm
                selectedCensus={selectedTreeCensus}
                editTreeCensus={editTreeCensus}
              />
            )}
            {StageList[stage] == "REVIEW" && (
              <ReviewForm
                selectedTree={selectedTree}
                selectedCensus={selectedTreeCensus}
              />
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
                onPress={() => finish(selectedTreeCensus)}
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

interface MetaFormProps {
  selectedTree: Tree;
  editTree: (changes: Partial<Tree>) => void;
}

const MetaDataForm: React.FC<MetaFormProps> = ({ selectedTree, editTree }) => {
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
          value={selectedTree?.tag || "0"}
          style={{ marginRight: 12 }}
          onConfirm={async (newValue) => {
            editTree({ tag: newValue });
          }}
          formComponent={<TextField label="Tree Tag" textType="SHORT_TEXT" />}
        />
        <FieldController
          value={selectedTree?.speciesCode || ""}
          onConfirm={(newValue) => {
            editTree({ speciesCode: newValue });
          }}
          style={{ flex: 1, marginRight: 12 }}
          formComponent={
            <TextField
              label="Species Code"
              textType="SHORT_TEXT"
              placeholder="Select code here"
            />
          }
          modalComponent={
            <SelectField label="Tree Species" pickerOptions={speciesOptions} />
          }
        />
        <FieldController
          value={selectedTree?.plotX?.toString() || "0"}
          style={{ marginRight: 12 }}
          onConfirm={(newValue) => {
            editTree({ plotX: Number(newValue) });
          }}
          formComponent={
            <TextField label="X Within Plot" textType="DECIMAL" suffix="m" />
          }
        />
        <FieldController
          value={selectedTree?.plotY?.toString() || "0"}
          onConfirm={(newValue) => {
            editTree({ plotY: Number(newValue) });
          }}
          formComponent={
            <TextField label="Y Within Plot" textType="DECIMAL" suffix="m" />
          }
        />
      </View>
    </View>
  );
};

interface DataFormProps {
  selectedCensus: TreeCensus;
  editTreeCensus: (changes: Partial<TreeCensus>) => void;
}

const DataForm: React.FC<DataFormProps> = ({
  editTreeCensus,
  selectedCensus,
}) => {
  const isConnected = useIsConnected();
  const dispatch = useAppDispatch();
  const { all: allLabels } = useAppSelector(
    (state: RootState) => state.treeLabels
  );
  const {
    all: allCensusLabels,
    indices: { byTreeCensus },
  } = useAppSelector((state) => state.treeCensusLabels);
  const selectedLabels = useMemo(
    () =>
      Array.from(byTreeCensus?.[selectedCensus.id] || []).map(
        (id) => allCensusLabels[id]
      ),
    [selectedCensus, byTreeCensus, allCensusLabels]
  );
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
      const newLabel = { treeCensusId: selectedCensus.id, treeLabelCode: code };
      dispatch(
        isConnected
          ? createTreeCensusLabel(newLabel)
          : locallyCreateTreeCensusLabel(newLabel)
      );
    },
    [dispatch, isConnected, selectedCensus.id]
  );
  const removeLabel = useCallback(
    (id: string) => {
      dispatch(
        isConnected
          ? deleteTreeCensusLabel(id)
          : locallyDeleteTreeCensusLabel(id)
      );
    },
    [dispatch, isConnected]
  );

  return (
    <View style={styles.formContainer}>
      <View style={styles.formRow}>
        <FieldController
          value={selectedCensus?.dbh?.toString() || "0"}
          style={{ width: 120 }}
          onConfirm={(newValue) => {
            editTreeCensus({ dbh: Number(newValue) });
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
                <LabelPillRow pills={selectedLabels} removePill={removeLabel} />
              }
            />
          }
          modalComponent={
            <SelectField label="Tree Labels" pickerOptions={labelsOptions} />
          }
        />
      </View>
      <View style={{ marginTop: 12 }}>
        <PhotoField census={selectedCensus} />
      </View>
      <View style={styles.formRow}>
        <FieldController
          value={selectedCensus.notes || ""}
          onConfirm={(newValue) => {
            editTreeCensus({ notes: newValue });
          }}
          style={{ flex: 1 }}
          formComponent={
            <TextField
              label="Notes"
              textType="LONG_TEXT"
              placeholder="Add miscellaneous notes here"
            />
          }
        />
      </View>
    </View>
  );
};

const ReviewableTreeFieldMap: { [key in keyof Tree]?: string } = {
  tag: "Tree Tag Number",
  speciesCode: "Species Code",
  plotX: "X coordinate within plot (meters)",
  plotY: "Y coordinate within plot (meters)",
};

const ReviewableCensusFieldMap: { [key in keyof TreeCensus]?: string } = {
  dbh: "DBH",
};

const ReviewableTreeFieldMapEntries = Object.entries(
  ReviewableTreeFieldMap
) as [keyof Tree, string][];

const ReviewableCensusFieldMapEntries = Object.entries(
  ReviewableCensusFieldMap
) as [keyof TreeCensus, string][];

interface ReviewFormProps {
  selectedCensus: TreeCensus;
  selectedTree: Tree;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  selectedCensus,
  selectedTree,
}) => {
  return (
    <View style={styles.formContainer}>
      <ScrollView
        style={styles.reviewScroll}
        showsVerticalScrollIndicator={true}
        persistentScrollbar={true}
      >
        {ReviewableTreeFieldMapEntries.map(([field, title]) => (
          <ReviewEntry
            key={title}
            field={title}
            value={selectedTree?.[field]?.toString() || "Not set"}
          />
        ))}
        {ReviewableCensusFieldMapEntries.map(([field, title]) => (
          <ReviewEntry
            key={title}
            field={title}
            value={selectedCensus?.[field]?.toString() || "Not set"}
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
