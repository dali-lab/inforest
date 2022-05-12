import { Tree, TreeCensus, TreeLabel } from "@ong-forestry/schema";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  locallyDraftNewTreeCensus,
  locallyUpdateTreeCensus,
} from "../../../redux/slices/treeCensusSlice";

export type FormStages = "META" | "DATA" | "REVIEW";

export const StageList: FormStages[] = ["META", "DATA", "REVIEW"];

interface DataEntryFormProps {
  selectedTree: Tree | undefined;
  selectedTreeCensus: TreeCensus | undefined;
  cancel: () => void;
  finish: () => void;
}

const DataEntryForm: React.FC<DataEntryFormProps & View["props"]> = ({
  finish,
  style,
  selectedTree,
  selectedTreeCensus,
}) => {
  console.log(selectedTreeCensus);
  const dispatch = useAppDispatch();

  const [stage, setStage] = useState<number>(0);
  const onFinish = useCallback(() => {
    finish();
  }, [finish]);

  const updateTreeDraft = useCallback(
    (updatedFields) => {
      if (selectedTree) {
        try {
          dispatch(
            locallyUpdateTree({
              updated: { ...selectedTree, ...updatedFields },
            })
          );
        } catch (err: any) {
          alert(err?.message || "An unknown error occurred.");
        }
      }
    },
    [dispatch, selectedTree, selectedTreeCensus]
  );

  const updateCensusDraft = useCallback(
    async (updatedFields) => {
      if (selectedTreeCensus?.id) {
        try {
          dispatch(
            locallyUpdateTreeCensus({
              updated: { ...selectedTreeCensus, ...updatedFields },
            })
          );
        } catch (err: any) {
          alert(err?.message || "An unknown error occurred.");
        }
      }
    },
    [dispatch, selectedTreeCensus]
  );

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
              <MetaDataForm
                selectedTree={selectedTree}
                updateTreeDraft={updateTreeDraft}
              />
            )}
            {StageList[stage] == "DATA" && (
              <DataForm
                selectedCensus={selectedTreeCensus}
                updateCensusDraft={updateCensusDraft}
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
                onPress={onFinish}
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
  updateTreeDraft: (changes: Partial<Tree>) => void;
}

const MetaDataForm: React.FC<MetaFormProps> = ({
  selectedTree,
  updateTreeDraft,
}) => {
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
            updateTreeDraft({ tag: newValue });
          }}
          formComponent={<TextField label="Tree Tag" textType="SHORT_TEXT" />}
        />
        <FieldController
          value={selectedTree?.speciesCode || ""}
          onConfirm={(newValue) => {
            updateTreeDraft({ speciesCode: newValue });
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
          value={selectedTree?.plotX?.toString() || "0"}
          style={{ marginRight: 12 }}
          onConfirm={(newValue) => {
            updateTreeDraft({ plotX: Number(newValue) });
          }}
          formComponent={
            <TextField label="X Within Plot" textType="DECIMAL" suffix="m" />
          }
        />
        <FieldController
          value={selectedTree?.plotY?.toString() || "0"}
          onConfirm={(newValue) => {
            updateTreeDraft({ plotY: Number(newValue) });
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
  updateCensusDraft: (changes: Partial<TreeCensus>) => void;
}

const DataForm: React.FC<DataFormProps> = ({
  updateCensusDraft,
  selectedCensus,
}) => {
  const { all: allLabels } = useAppSelector(
    (state: RootState) => state.treeLabels
  );
  const [pills, setPills] = useState<TreeLabel[]>(selectedCensus?.labels || []);
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
      if (!(code in pills.map((label) => label?.code)))
        setPills((prev) => [...prev, allLabels[code]]);
    },
    [allLabels, pills, setPills]
  );
  const removeLabel = useCallback(
    (code: string) => {
      setPills((prev) => prev.filter((label) => label?.code !== code));
    },
    [setPills]
  );

  useEffect(() => {
    updateCensusDraft({ labels: pills });
  }, [pills]);
  return (
    <View style={styles.formContainer}>
      <View style={styles.formRow}>
        <FieldController
          value={selectedCensus?.dbh?.toString() || "0"}
          onConfirm={(newValue) => {
            updateCensusDraft({ dbh: Number(newValue) });
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
                  pills={
                    selectedCensus?.labels?.map((label) => label?.code) || []
                  }
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
        <PhotoField
          census={selectedCensus}
          onUpdate={(photos) => {
            updateCensusDraft({ photos });
          }}
        />
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
