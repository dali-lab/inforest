import React from "react";
import { StyleSheet, Switch, TextInput, View } from "react-native";
import { Stack } from "react-native-spacing-system";
import Modal from "./Modal";
import { VisualizationConfigType } from "../constants";
import { Text, TextVariants } from "./Themed";

interface VisualizationModalProps {
  config: VisualizationConfigType;
  setConfig: React.Dispatch<React.SetStateAction<VisualizationConfigType>>;
}

const VisualizationModal: React.FC<VisualizationModalProps> = ({
  config,
  setConfig,
}) => {
  return (
    <Modal title="Visualization Settings">
      <View style={styles.modalContent}>
        <View style={styles.toggleRow}>
          <Text variant={TextVariants.Body}>Satellite</Text>
          <Switch
            value={config.satellite}
            onValueChange={(value) => {
              setConfig((prev: VisualizationConfigType) => ({
                ...prev,
                satellite: value,
              }));
            }}
          ></Switch>
        </View>
        <Stack size={12}></Stack>
        <View style={styles.toggleRow}>
          <Text variant={TextVariants.Body}>Species colorization</Text>
          <Switch
            value={config.colorBySpecies}
            onValueChange={(value) => {
              setConfig((prev: VisualizationConfigType) => ({
                ...prev,
                colorBySpecies: value,
              }));
            }}
          />
        </View>
        {config.colorBySpecies && (
          <>
            <Stack size={12}></Stack>
            <View style={styles.toggleRow}>
              <Text variant={TextVariants.Body}>Number of species shown</Text>
              <TextInput
                defaultValue={config.numOfSpecies.toString()}
                keyboardType="numeric"
                onSubmitEditing={(e) => {
                  const numOfSpecies = parseInt(e.nativeEvent.text);
                  if (isNaN(numOfSpecies)) {
                    return;
                  }
                  setConfig((prev) => ({
                    ...prev,
                    numOfSpecies,
                  }));
                }}
                returnKeyType="done"
              />
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {},
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default VisualizationModal;
