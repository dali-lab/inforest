import { ForestCensus } from "@ong-forestry/schema/src/forest-census";
import React, { useEffect, useMemo } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Text, TextStyles, TextVariants } from "../../components/Themed";
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
import { Queue, Stack } from "react-native-spacing-system";
import { useNavigation } from "@react-navigation/native";
import ForestView from "../MapScreen/ExploreView";
import { Picker } from "@react-native-picker/picker";
import { useDispatch } from "react-redux";
import { selectTreeCensus } from "../../redux/slices/treeCensusSlice";
import Colors from "../../constants/Colors";
import { getAllTreeLabels } from "../../redux/slices/treeLabelSlice";
import { getAllTreePhotoPurposes } from "../../redux/slices/treePhotoPurposeSlice";
import { getForestForestCensuses } from "../../redux/slices/forestCensusSlice";
import {
  convertToNaturalLanguage,
  MapScreenModes,
  MapScreenZoomLevels,
} from "../../constants";
import {
  getForestCensusPlotCensuses,
  getPlotCensuses,
} from "../../redux/slices/plotCensusSlice";
import AppButton from "../../components/AppButton";
import { Ionicons } from "@expo/vector-icons";
import { PlotCensusStatuses } from "@ong-forestry/schema";
import RNPickerSelect from "react-native-picker-select";

const TABLE_COLUMN_WIDTHS = {
  PLOT_NUMBER: 96,
  STATUS: 128,
  ACTION: 96,
};

const ProjectSelector = () => {
  const dispatch = useDispatch();
  const reduxState = useAppSelector((state: RootState) => state);
  const { all, selected } = reduxState.forestCensuses;

  const [selecting, setSelecting] = React.useState(false);
  return (
    <View style={{ position: "relative" }}>
      <RNPickerSelect
        value={selected?.id}
        onValueChange={(value) => console.log(value)}
        items={Object.values(all).map((project) => ({
          label: project.name,
          value: project.id,
        }))}
      />
      {/* <Pressable onPress={() => setSelecting(true)}>
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
      )} */}
    </View>
  );
};

export const HomeScreen = () => {
  const navigation = useNavigation();

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getForests());
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
    dispatch(getPlotCensuses());
  }, [dispatch]);

  const reduxState = useAppSelector((state: RootState) => state);
  const { currentForest, currentTeamForests: allForests } = reduxState.forest;
  const { selected, all: allForestCensuses } = reduxState.forestCensuses;
  const { all: allPlots } = reduxState.plots;
  const { all: allPlotCensus } = reduxState.plotCensuses;

  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  if (!currentForest) {
    return null;
  }
  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        padding: 64,
        alignItems: "stretch",
        height: windowHeight,
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
        <Image
          style={{
            height: TextStyles[TextVariants.H1].fontSize,
            width: TextStyles[TextVariants.H1].fontSize,
            resizeMode: "contain",
          }}
          source={require("../../assets/images/logo.png")}
        ></Image>
      </View>
      <Stack size={12}></Stack>
      <View style={{ flexDirection: "row" }}>
        <RNPickerSelect
          value={currentForest?.id}
          onValueChange={(value) => console.log(value)}
          items={allForests.map(({ name, id }) => ({
            label: name,
            value: id,
          }))}
          placeholder="Select a forest..."
          style={{
            inputIOS: {
              ...TextStyles[TextVariants.H3],
              paddingRight: TextStyles[TextVariants.H3].fontSize * 1.3,
            },
            iconContainer: {
              top: TextStyles[TextVariants.H3].fontSize * 0.125,
            },
          }}
          Icon={() => (
            <Ionicons
              name="ios-chevron-down-circle-outline"
              size={TextStyles[TextVariants.H3].fontSize}
            ></Ionicons>
          )}
        />
        <Queue size={TextStyles[TextVariants.H3].fontSize / 2}></Queue>
        <Text variant={TextVariants.H3}>/</Text>
        <Queue size={TextStyles[TextVariants.H3].fontSize / 2}></Queue>
        <RNPickerSelect
          value={selected?.id}
          onValueChange={(value) => console.log(value)}
          items={Object.values(allForestCensuses).map(({ name, id }) => ({
            label: name,
            value: id,
          }))}
          placeholder="Select a project..."
          style={{
            inputIOS: {
              ...TextStyles[TextVariants.H3],
              paddingRight: TextStyles[TextVariants.H3].fontSize * 1.3,
            },
            iconContainer: {
              top: TextStyles[TextVariants.H3].fontSize * 0.125,
            },
          }}
          Icon={() => (
            <Ionicons
              name="ios-chevron-down-circle-outline"
              size={TextStyles[TextVariants.H3].fontSize}
            ></Ionicons>
          )}
        />
      </View>

      <Stack size={24}></Stack>
      <View
        style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            position: "absolute",
            top: 24,
            right: 24,
            zIndex: 1,
          }}
        >
          <Ionicons
            name="ios-open-outline"
            size={TextStyles[TextVariants.Label].fontSize}
            style={{ marginTop: 1 }}
          ></Ionicons>
          <Queue size={TextStyles[TextVariants.Label].fontSize / 2}></Queue>
          <Text variant={TextVariants.Label}>Tap to open full map</Text>
        </View>
        <Pressable
          style={{
            width: "100%",
            height: windowWidth / 2,
          }}
          onPress={() => {
            // @ts-ignore
            navigation.navigate("map", {
              mode: MapScreenModes.Plot,
              zoomLevel: MapScreenZoomLevels.Forest,
            });
          }}
        >
          <ForestView
            mode={MapScreenModes.Plot}
            switchMode={() => {}}
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
      <Stack size={24}></Stack>
      <View
        style={{
          backgroundColor: Colors.neutral[1],
          height: 512,
          overflow: "hidden",
          borderRadius: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: Colors.neutral[8],
            paddingVertical: 12,
            paddingHorizontal: 24,
          }}
        >
          <Text
            style={{ width: TABLE_COLUMN_WIDTHS.PLOT_NUMBER }}
            variant={TextVariants.Label}
            color="white"
          >
            Plot #
          </Text>
          <Text
            style={styles.collaboratorsColumn}
            variant={TextVariants.Label}
            color="white"
          >
            Collaborators
          </Text>
          <Text
            style={{ width: TABLE_COLUMN_WIDTHS.STATUS }}
            variant={TextVariants.Label}
            color="white"
          >
            Status
          </Text>
          <Text
            style={{ width: TABLE_COLUMN_WIDTHS.ACTION }}
            variant={TextVariants.Label}
            color="white"
          >
            Action
          </Text>
        </View>
        <ScrollView>
          {Object.values(allPlotCensus).map((plotCensuses) => {
            let statusColor = Colors.status.problem;
            let actionButtonText = "";
            switch (plotCensuses.status) {
              case PlotCensusStatuses.InProgress:
                statusColor = Colors.status.ongoing;
                actionButtonText = "Plot";
                break;
              case PlotCensusStatuses.Pending:
                statusColor = Colors.status.waiting;
                actionButtonText = "View";

                break;
              case PlotCensusStatuses.Approved:
                statusColor = Colors.status.done;
                actionButtonText = "View";
                break;
            }

            return (
              <View
                key={plotCensuses.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                }}
              >
                <Text
                  style={{ width: TABLE_COLUMN_WIDTHS.PLOT_NUMBER }}
                  variant={TextVariants.Label}
                >
                  {allPlots[plotCensuses.plotId].number}
                </Text>
                <Text
                  style={styles.collaboratorsColumn}
                  variant={TextVariants.Label}
                >
                  {plotCensuses.authors
                    ?.map((author) => author.firstName + " " + author.lastName)
                    .join(", ")}
                </Text>
                <View
                  style={{
                    width: TABLE_COLUMN_WIDTHS.STATUS,
                    flexDirection: "row",
                  }}
                >
                  <View
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 8,
                      borderRadius: 12,
                      backgroundColor: statusColor,
                    }}
                  >
                    <Text
                      variant={TextVariants.SmallLabel}
                      color={Colors.neutral[8]}
                    >
                      {convertToNaturalLanguage(
                        plotCensuses.status,
                        "ALL_UPPER"
                      )}
                    </Text>
                  </View>
                </View>
                <View>
                  <AppButton
                    // @ts-ignore
                    onPress={() =>
                      navigation.navigate("map", {
                        mode: MapScreenModes.Plot,
                        zoomLevel: MapScreenZoomLevels.Plot,
                        selectedPlot: allPlots[plotCensuses.plotId],
                      })
                    }
                    icon={<Ionicons name={"ios-eye"} size={16} />}
                    type="PLAIN"
                  >
                    {actionButtonText}
                  </AppButton>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  collaboratorsColumn: {
    flex: 1,
  },
});
