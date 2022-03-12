import { BlurView } from "expo-blur";
import React, { useMemo, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Queue, Stack } from "react-native-spacing-system";
import { VisualizationConfigType } from "../constants";
import Colors from "../constants/Colors";
import useAppDispatch from "../hooks/useAppDispatch";
import useAppSelector from "../hooks/useAppSelector";
import { RootState } from "../redux";
import { getTreeSpecies } from "../redux/slices/treeSpeciesSlice";
import { Text, TextVariants } from "./Themed";

interface ColorKeyProps {
  config: VisualizationConfigType;
}

const ColorKey: React.FC<ColorKeyProps> = ({ config }) => {
  const {
    all: allSpecies,
    colorMap,
    frequencyMap,
  } = useAppSelector((state: RootState) => state.treeSpecies);
  const speciesToRender = useMemo(
    () =>
      Object.entries(frequencyMap)
        .sort((a, b) => a[1] - b[1])
        .slice(0, config.numOfSpecies),
    [config]
  );
  return (
    <BlurView intensity={40}>
      <View style={styles.container}>
        {speciesToRender.map(([speciesCode, _]) => (
          <>
            <KeyRow
              key={speciesCode}
              color={colorMap[speciesCode]}
              species={allSpecies?.[speciesCode]?.commonName}
            />
            <Stack key={`${speciesCode}-spacer`} size={6}></Stack>
          </>
        ))}
        <KeyRow
          key="Miscellaneous"
          color={Colors.primary.normal}
          species="Miscellaneous"
        ></KeyRow>
      </View>
    </BlurView>
  );
};

interface KeyRowProps {
  color: string;
  species: string;
}

const KeyRow: React.FC<KeyRowProps> = ({ color, species }) => {
  return (
    <View style={styles.keyRow}>
      <View style={[styles.circle, { backgroundColor: color }]} />
      <Queue size={12}></Queue>
      <Text>{species}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  keyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default ColorKey;
