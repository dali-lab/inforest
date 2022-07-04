import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Text, TextStyles, TextVariants } from "../../components/Themed";
import useAppSelector from "../../hooks/useAppSelector";
import { useIsConnected } from "react-native-offline";
import { RootState } from "../../redux";
import { selectForest, getForests } from "../../redux/slices/forestSlice";
import { Queue, Stack } from "react-native-spacing-system";
import { useNavigation } from "@react-navigation/native";
import ForestView from "../MapScreen/ExploreView";
import Colors from "../../constants/Colors";
import {
  convertToNaturalLanguage,
  MapScreenModes,
  MapScreenZoomLevels,
} from "../../constants";
import AppButton from "../../components/AppButton";
import { Ionicons } from "@expo/vector-icons";
import { PlotCensusStatuses } from "@ong-forestry/schema";
import RNPickerSelect from "react-native-picker-select";
import {
  loadForestData,
  resetData,
  uploadCensusData,
} from "../../redux/slices/syncSlice";
import { titled_logo } from "../../assets/images";
import { getUserByToken, logout } from "../../redux/slices/userSlice";
import { getTeams } from "../../redux/slices/teamSlice";
import useAppDispatch from "../../hooks/useAppDispatch";
import { selectForestCensus } from "../../redux/slices/forestCensusSlice";
import { selectPlot } from "../../redux/slices/plotSlice";
import { selectPlotCensus } from "../../redux/slices/plotCensusSlice";
import OfflineBar from "../../components/OfflineBar";
import LoadingOverlay from "../../components/LoadingOverlay";

const TABLE_COLUMN_WIDTHS = {
  PLOT_NUMBER: 96,
  STATUS: 128,
  ACTION: 96,
};

export const HomeScreen = () => {
  const navigation = useNavigation();

  const isConnected = useIsConnected();
  const {
    _persist: { rehydrated },
  } = useAppSelector((state) => state);
  const {
    token,
    currentUser,
    loading: userLoading,
  } = useAppSelector((state) => state.user);

  const { currentTeam: currentTeamId, loading: teamLoading } = useAppSelector(
    (state) => state.teams
  );

  const dispatch = useAppDispatch();

  const [userFetched, setUserFetched] = useState<boolean>(false);
  const [censusRefreshed, setCensusRefreshed] = useState<boolean>(false);
  const [censusLoaded, setCensusLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!isConnected) {
      setUserFetched(false);
      setCensusRefreshed(false);
      setCensusLoaded(false);
    }
  }, [isConnected]);

  const fetchUserData = useCallback(async () => {
    if (!(isConnected && rehydrated && token && currentUser?.id)) return;
    setUserFetched(true);
    await dispatch(getUserByToken(token));
    await dispatch(getTeams(currentUser.id));
  }, [isConnected, rehydrated, token, currentUser, setUserFetched]);

  const refreshCensusData = useCallback(async () => {
    if (!(isConnected && rehydrated && token && currentTeamId)) return;
    setCensusRefreshed(true);
    await dispatch(uploadCensusData());
    dispatch(resetData());
    await dispatch(getForests(currentTeamId));
  }, [isConnected, rehydrated, token, currentTeamId, setCensusRefreshed]);

  useEffect(() => {
    try {
      if (!userFetched) fetchUserData();
    } catch (err) {
      alert(
        "Unable to load user data. If your connection is reliable, this is likely due to a server error."
      );
    }
  }, [fetchUserData, userFetched]);
  useEffect(() => {
    try {
      if (!censusRefreshed) refreshCensusData();
    } catch (err) {
      alert(
        "Unable to load census data. If your connection is reliable, this is likely due to a server error."
      );
    }
  }, [refreshCensusData, censusRefreshed]);
  const {
    all: allForests,
    selected: selectedForestId,
    indices: { byTeam },
    loading: forestLoading,
  } = useAppSelector((state: RootState) => state.forest);

  const loadCensusData = useCallback(async () => {
    if (!(isConnected && rehydrated && token && selectedForestId)) return;
    setCensusLoaded(true);
    await dispatch(loadForestData(selectedForestId));
  }, [isConnected, rehydrated, token, selectedForestId, setCensusLoaded]);
  const {
    selected: selectedForestCensusId,
    all: allForestCensuses,
    loading: forestCensusLoading,
    indices: { byForests },
  } = useAppSelector((state: RootState) => state.forestCensuses);
  const { all: allPlots } = useAppSelector((state: RootState) => state.plots);
  const {
    all: allPlotCensus,
    indices: { byForestCensuses },
  } = useAppSelector((state: RootState) => state.plotCensuses);
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const availableForests = useMemo(
    () =>
      currentTeamId
        ? Array.from(byTeam?.[currentTeamId] || []).map((id) => allForests[id])
        : [],
    [byTeam, allForests, currentTeamId]
  );
  useEffect(() => {
    try {
      if (!censusLoaded) loadCensusData();
    } catch (err) {
      alert(
        "Unable to load data. If your connection is reliable, this is likely due to a server error."
      );
    }
  }, [loadCensusData, censusLoaded]);

  useEffect(() => {
    if (availableForests.length > 0 && !selectedForestId) {
      dispatch(selectForest(availableForests[0].id));
    }
  }, [availableForests]);

  if (availableForests.length === 0) {
    return (
      <View
        style={{
          flexDirection: "column",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 128,
        }}
      >
        {userLoading || forestLoading || teamLoading || forestCensusLoading ? (
          <>
            <Image
              style={{ height: 111, width: 150, marginBottom: 24 }}
              source={titled_logo}
            ></Image>
            <Text variant={TextVariants.H2}>Loading Data</Text>
            <ActivityIndicator
              style={{ marginTop: 24 }}
              size="large"
              color="black"
            />
          </>
        ) : (
          <>
            <Text
              variant={TextVariants.H2}
              style={{ textAlign: "center", marginBottom: 16 }}
            >
              Your account currently has no forests available. Create a new team
              and forest or ask a forest admin to invite you to their team.
            </Text>
            <AppButton
              onPress={() => {
                dispatch(logout());
              }}
              type="RED"
            >
              Log Out
            </AppButton>
          </>
        )}
      </View>
    );
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          padding: 64,
          alignItems: "stretch",
          height: windowHeight,
          flexGrow: 1,
        }}
        contentInset={{ bottom: 100 }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <Text variant={TextVariants.H1}>
            Welcome, {currentUser?.firstName}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <Ionicons
              name="person-outline"
              size={TextStyles[TextVariants.H1].fontSize}
              onPress={() => {
                // @ts-ignore
                navigation.navigate("profile", {});
              }}
            />
            <Image
              style={{
                marginLeft: 16,
                height: TextStyles[TextVariants.H1].fontSize,
                width: TextStyles[TextVariants.H1].fontSize,
                resizeMode: "contain",
              }}
              source={require("../../assets/images/logo.png")}
            />
          </View>
        </View>
        <Stack size={12}></Stack>
        <View style={{ flexDirection: "row" }}>
          <RNPickerSelect
            itemKey="id"
            value={selectedForestId}
            onValueChange={(value) => {
              dispatch(selectForest(value));
            }}
            items={availableForests.map(({ name, id }) => ({
              label: name,
              value: id,
            }))}
            placeholder={{ label: "Loading forests...", value: undefined }}
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
            itemKey="id"
            value={
              selectedForestCensusId &&
              allForestCensuses[selectedForestCensusId]?.id
            }
            onValueChange={(value) => {
              dispatch(selectForestCensus(value));
            }}
            items={Object.values(allForestCensuses).map(({ name, id }) => ({
              label: name,
              value: id,
            }))}
            placeholder={{
              label: forestCensusLoading
                ? "Loading projects..."
                : "Select a project",
              value: undefined,
            }}
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
            <ForestView
              mode={MapScreenModes.Plot}
              switchMode={() => {}}
              beginPlotting={() => {}}
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
            {Object.values(allPlotCensus)
              .filter((plotCensus) => {
                try {
                  return (
                    selectedForestCensusId &&
                    byForestCensuses?.[selectedForestCensusId].has(
                      plotCensus.id
                    )
                  );
                } catch (e) {
                  return false;
                }
              })
              .map((plotCensuses) => {
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
                      {(plotCensuses.plotId &&
                        allPlots?.[plotCensuses.plotId]?.number) ||
                        "No number"}
                    </Text>
                    <Text
                      style={styles.collaboratorsColumn}
                      variant={TextVariants.Label}
                    >
                      {plotCensuses.authors
                        ?.map(
                          (author) => author.firstName + " " + author.lastName
                        )
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
                          minWidth: 100,
                        }}
                      >
                        <Text
                          variant={TextVariants.SmallLabel}
                          color={Colors.neutral[8]}
                          style={{
                            textAlign: "center",
                          }}
                        >
                          {convertToNaturalLanguage(
                            plotCensuses.status,
                            "ALL_UPPER"
                          )}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        minWidth: 100,
                      }}
                    >
                      <AppButton
                        // @ts-ignore
                        onPress={() => {
                          dispatch(selectPlot(plotCensuses.plotId));
                          dispatch(selectPlotCensus(plotCensuses.id));
                          // @ts-ignore
                          navigation.navigate("map", {
                            mode: MapScreenModes.Plot,
                            zoomLevel: MapScreenZoomLevels.Plot,
                            selectedPlot: allPlots[plotCensuses.plotId],
                          });
                        }}
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
    </>
  );
};

const styles = StyleSheet.create({
  collaboratorsColumn: {
    flex: 1,
  },
});
