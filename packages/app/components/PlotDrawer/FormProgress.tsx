import React, { useMemo } from "react";
import { StyleSheet, View, Pressable, Text } from "react-native";
import EditIcon from "../../assets/icons/edit-icon.svg";
import MetaIcon from "../../assets/icons/meta-icon.svg";
import SaveIcon from "../../assets/icons/save-icon.svg";

interface FormProgressProps {
  stage: number;
  setStage: React.Dispatch<React.SetStateAction<number>>;
}

const FormProgress: React.FC<FormProgressProps> = ({ stage, setStage }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.stageRow}>
        <StageBubble
          stage={0}
          currentStage={stage}
          Icon={MetaIcon}
          title="Tree Info"
          setStage={setStage}
        />
        <StageDivider />
        <StageBubble
          stage={1}
          currentStage={stage}
          Icon={EditIcon}
          title="Census Data"
          setStage={setStage}
        />
        <StageDivider />
        <StageBubble
          stage={2}
          currentStage={stage}
          Icon={SaveIcon}
          title="Review & Save"
          setStage={setStage}
        />
      </View>
    </View>
  );
};

type StageProgress = "DISABLED" | "INPROGRESS" | "COMPLETE";

type StageBubbleProps = {
  // stage: FormStages;
  stage: number;
  Icon: React.ElementType;
  title: string;
  currentStage: number;
  setStage: React.Dispatch<React.SetStateAction<number>>;
};

const BubbleBackground: { [key in StageProgress]: string } = {
  DISABLED: "#1F3527",
  INPROGRESS: "#FFFFFF",
  COMPLETE: "#69CD6F",
};

const StageBubble: React.FC<StageBubbleProps> = ({
  stage,
  Icon,
  title,
  currentStage,
  setStage,
}) => {
  const progress = useMemo<StageProgress>(() => {
    if (stage == currentStage) return "INPROGRESS";
    if (stage < currentStage) return "COMPLETE";
    return "DISABLED";
  }, [stage, currentStage]);
  return (
    <View style={styles.stageGroup}>
      <Pressable
        style={[
          styles.stageBubble,
          {
            backgroundColor: BubbleBackground[progress],
          },
        ]}
        onPress={() => {
          setStage(stage);
        }}
      >
        <Icon
          style={styles.stageIcon}
          stroke={progress == "INPROGRESS" ? "#1F3527" : "white"}
          strokeWidth={3}
        />
      </Pressable>
      <Text
        style={[
          styles.stageTitle,
          { color: progress == "INPROGRESS" ? "#1F3527" : "#5F6D64" },
        ]}
      >
        {title}
      </Text>
    </View>
  );
};

const StageDivider: React.FC = () => <View style={styles.stageDivider} />;

// TODO: consolidate styles
const styles = StyleSheet.create({
  wrapper: {
    display: "flex",
    flexDirection: "column",
  },
  stageRow: {
    display: "flex",
    flexDirection: "row",
    // alignItems: "center",
  },
  stageGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 48,
  },
  stageBubble: {
    backgroundColor: "white",
    height: 72,
    width: 72,
    borderRadius: 36,
    marginVertical: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stageIcon: {
    width: 36,
    height: 36,
  },
  stageTitle: {
    fontFamily: "Nunito Black",
    position: "absolute",
    top: 96,
    width: "150%",
    textAlign: "center",
  },
  stageDivider: {
    height: 3,
    width: 108,
    backgroundColor: "#5F6D64",
    top: 52,
    marginHorizontal: 8,
  },
});

export default FormProgress;
