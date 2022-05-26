import { ForestCensus } from "@ong-forestry/schema/src/forest-census";
import React, { useEffect, useMemo } from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { Text, TextVariants } from "../../components/Themed";
import useAppDispatch from "../../hooks/useAppDispatch";
import useAppSelector from "../../hooks/useAppSelector";
import { RootState } from "../../redux";
import {
  changeForest,
  getForest,
  getForests,
} from "../../redux/slices/forestSlice";
import { FOREST_ID } from "../../constants/dev";
import { getForestTrees } from "../../redux/slices/treeSlice";
import { getForestPlots } from "../../redux/slices/plotSlice";
import { getAllTreeSpecies } from "../../redux/slices/treeSpeciesSlice";
import MapView from "react-native-maps";
import { BlurView } from "expo-blur";
import { Stack } from "react-native-spacing-system";
import { useNavigation } from "@react-navigation/native";
import ForestView from "../MapScreen/ExploreView";
import { Picker } from "@react-native-picker/picker";
import { useDispatch } from "react-redux";
import { selectTreeCensus } from "../../redux/slices/treeCensusSlice";
import Colors from "../../constants/Colors";
import { getAllTreeLabels } from "../../redux/slices/treeLabelSlice";
import { getAllTreePhotoPurposes } from "../../redux/slices/treePhotoPurposeSlice";
import { getForestForestCensuses } from "../../redux/slices/forestCensusSlice";
import { convertToNaturalLanguage } from "../../constants";

const ProjectSelector = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getForest({ id: FOREST_ID }));
    dispatch(getForestPlots({ forestId: FOREST_ID }));
    dispatch(
      getForestTrees({
        forestId: FOREST_ID,
      })
    );
    dispatch(getAllTreeSpecies());
    dispatch(getAllTreeLabels());
    dispatch(getAllTreePhotoPurposes());
    dispatch(getForestForestCensuses({ forestId: FOREST_ID }));
  }, [dispatch]);

  const reduxState = useAppSelector((state: RootState) => state);
  const { all, selected } = reduxState.forestCensuses;

  const [selecting, setSelecting] = React.useState(false);
  return (
    <View style={{ position: "relative" }}>
      <Pressable onPress={() => setSelecting(true)}>
        <Text variant={TextVariants.Label}>
          {selected?.name ?? "No project"}
        </Text>
      </Pressable>
      {selecting && (
        <Picker
          selectedValue={selected?.id}
          onValueChange={(newProjectId) => {
            setSelecting(false);
            dispatch(selectTreeCensus(newProjectId));
          }}
          style={{
            position: "absolute",
            top: 32,
            right: 0,
            backgroundColor: "white",
            borderRadius: 12,
            padding: 6,
            width: "100%",
          }}
          itemStyle={{
            fontSize: 16,
          }}
        >
          {Object.values(all).map((project) => {
            return (
              <Picker.Item
                key={project.id}
                value={project.id}
                label={project.name}
              >
                <Text variant={TextVariants.Label}>{project.name}</Text>
              </Picker.Item>
            );
          })}
        </Picker>
      )}
    </View>
  );
};

export const HomeScreen = () => {
  const navigation = useNavigation();

  const reduxState = useAppSelector((state: RootState) => state);
  const { currentForest, currentTeamForests: allForests } = reduxState.forest;
  const { selected } = reduxState.forestCensuses;
  const { all: allPlots } = reduxState.plots;
  const { all: allPlotCensus } = reduxState.plotCensuses;

  const forestCensus: ForestCensus[] = useMemo(() => {
    return (
      currentForest?.id && [
        {
          id: "1",
          name: "2022",
          active: true,
          forestId: currentForest?.id,
        },
        {
          id: "1",
          name: "2021",
          active: false,
          forestId: currentForest?.id,
        },
        {
          id: "1",
          name: "2020",
          active: false,
          forestId: currentForest?.id,
        },
        {
          id: "1",
          name: "2019",
          active: false,
          forestId: currentForest?.id,
        },
      ]
    );
  }, [currentForest?.id]);

  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        padding: 64,
        alignItems: "stretch",
        height: useWindowDimensions().height,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <Text variant={TextVariants.H1}>Welcome, Ziray</Text>
        <Text variant={TextVariants.Label}>
          {currentForest?.name ?? "No forest"}
        </Text>
        <ProjectSelector></ProjectSelector>
      </View>
      <Stack size={36}></Stack>
      <View
        style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}
      >
        <Pressable
          style={{
            width: "100%",
            height: useWindowDimensions().width / 2,
          }}
          onPress={() => {
            // @ts-ignore
            navigation.navigate("map", {});
          }}
        >
          <ForestView
            selectPlot={() => {}}
            beginPlotting={() => {}}
            deselectPlot={() => {}}
            showUI={false}
            showTrees={false}
          ></ForestView>
        </Pressable>
      </View>
      <Stack size={36}></Stack>
      <Text variant={TextVariants.H2}>Plots in progress</Text>
      <Stack size={12}></Stack>
      <View
        style={{
          backgroundColor: Colors.neutral[1],
          padding: 24,
          borderRadius: 12,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text variant={TextVariants.Label}>Plot number</Text>
          <Text variant={TextVariants.Label}>Collaborators</Text>
          <Text variant={TextVariants.Label}>Status</Text>
        </View>
        <Stack size={12}></Stack>
        <View style={{ height: 2, backgroundColor: Colors.neutral[8] }}></View>
        <Stack size={12}></Stack>
        {Object.values(allPlotCensus).map((plotCensuses) => {
          return (
            <View
              key={plotCensuses.id}
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text variant={TextVariants.Label}>
                {allPlots[plotCensuses.plotId].number}
              </Text>
              <Text variant={TextVariants.Label}>
                {plotCensuses.authors
                  ?.map((author) => author.firstName + " " + author.lastName)
                  .join(", ")}
              </Text>
              <Text variant={TextVariants.Label}>
                {convertToNaturalLanguage(plotCensuses.status)}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};
