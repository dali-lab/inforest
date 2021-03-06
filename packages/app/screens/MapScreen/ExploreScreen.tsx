import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, StyleSheet, View } from "react-native";
import MapView, {
  Marker,
  Polygon,
  Circle,
  Region,
  LatLng,
} from "react-native-maps";
import * as Location from "expo-location";
import { PermissionStatus } from "expo-modules-core";
import * as geolib from "geolib";
import { Ionicons } from "@expo/vector-icons";
import * as utm from "utm";
import dateformat from "dateformat";
import { Plot, PlotCensusStatuses, Tree } from "@ong-forestry/schema";

import { Text, TextVariants } from "../../components/Themed";
import Colors from "../../constants/Colors";
import useAppDispatch from "../../hooks/useAppDispatch";
import PlotDrawer from "../../components/PlotDrawer";

import { deselectTree, selectTree } from "../../redux/slices/treeSlice";
import { getPlotCorners } from "../../constants/plots";
import VisualizationModal from "../../components/VisualizationModal";
import SearchModal from "../../components/SearchModal";
import ColorKey from "../../components/ColorKey";
import useAppSelector, { usePlotsInRegion } from "../../hooks/useAppSelector";
import { RootState } from "../../redux";

import {
  DEFAULT_DBH,
  DrawerStates,
  MapScreenModes,
  MapScreenZoomLevels,
  VisualizationConfigType,
} from "../../constants";
import { useNavigation } from "@react-navigation/native";
import { max, min } from "lodash";
import { MapOverlay } from "../../components/MapOverlay";
import { ModeSwitcher } from "./ModeSwitcher";
import { Queue } from "react-native-spacing-system";
import Color from "color";
import { selectPlot, deselectPlot } from "../../redux/slices/plotSlice";
import {
  createPlotCensus,
  deselectPlotCensus,
  selectPlotCensus,
} from "../../redux/slices/plotCensusSlice";
import { deselectTreeCensus } from "../../redux/slices/treeCensusSlice";
import { useIsConnected } from "react-native-offline";
import ConfirmationModal from "../../components/ConfirmationModal";
import LoadingOverlay from "../../components/LoadingOverlay";

const O_FARM_LAT = 43.7348569458618;
const O_FARM_LNG = -72.2519099587406;
const MIN_REGION_DELTA = 0.0000005;
const FOLIAGE_MAGNIFICATION = 3;
const NUM_OF_SPECIES = 8;

const plotCensusColorMap: { [key in PlotCensusStatuses]?: string } = {
  IN_PROGRESS: Color(Colors.status.ongoing).fade(0.5).string(),
  PENDING: Color(Colors.status.waiting).fade(0.5).string(),
  APPROVED: Color(Colors.status.done).fade(0.5).string(),
};

type ForestViewProps = {
  mode: MapScreenModes;
  showUI?: boolean;
  showTrees?: boolean;
};

const ForestView: React.FC<ForestViewProps> = (props) => {
  const { mode = MapScreenModes.Plot, showUI = true, showTrees = true } = props;

  const [viewMode, setViewMode] = useState<MapScreenModes>(mode);

  const navigation = useNavigation();

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [regionSnapshot, setRegionSnapshot] = useState<Region>();
  const [drawerHeight, setDrawerHeight] = useState(0);
  const [drawerState, setDrawerState] = useState<DrawerStates>(
    DrawerStates.Minimized
  );
  const [confirmationModalOpen, setConfirmationModalOpen] =
    useState<boolean>(false);

  const [locationPermissionStatus, setLocationPermissionStatus] =
    useState<PermissionStatus>();
  const [userPos, setUserPos] = useState<LatLng>({
    latitude: O_FARM_LAT,
    longitude: O_FARM_LNG,
  });

  const [_speciesFrequencyMap, setSpeciesFrequencyMap] = useState<{
    [species: string]: number;
  }>({});
  const [visualizationConfig, setVisualizationConfig] =
    useState<VisualizationConfigType>({
      modalOpen: false,
      colorBySpecies: false,
      numOfSpecies: NUM_OF_SPECIES,
      satellite: false,
    });

  const mapRef = useRef<MapView>(null);

  const dispatch = useAppDispatch();
  const reduxState = useAppSelector((state: RootState) => state);
  const {
    all: allTrees,
    selected: selectedTreeId,
    indices: { byPlots, byTag },
  } = useAppSelector((state: RootState) => state.trees);
  const {
    all: allTreeCensuses,
    indices: { byTreeActive },
    selected: selectedTreeCensusId,
  } = useAppSelector((state: RootState) => state.treeCensuses);
  const {
    all: allPlots,
    latitude,
    longitude,
    selected: selectedPlotId,
  } = useAppSelector((state: RootState) => state.plots);
  const { selected: selectedForestCensusId } = useAppSelector(
    (state: RootState) => state.forestCensuses
  );
  const {
    all: allPlotCensuses,
    selected: selectedPlotCensusId,
    indices: { byForestCensuses },
  } = useAppSelector((state: RootState) => state.plotCensuses);
  const { loadingTasks } = useAppSelector((state) => state.sync);

  const plotCensusesByActivePlot = useMemo(() => {
    if (!selectedForestCensusId || !byForestCensuses?.[selectedForestCensusId])
      return {};
    const index: Record<string, string> = {};
    byForestCensuses[selectedForestCensusId].forEach((plotCensusId) => {
      const census = allPlotCensuses[plotCensusId];
      index[census.plotId] = plotCensusId;
    });
    return index;
  }, [selectedForestCensusId, byForestCensuses, allPlotCensuses]);

  const { colorMap } = useAppSelector((state: RootState) => state.treeSpecies);

  const isConnected = useIsConnected();

  const forestBoundaries = useMemo(() => {
    if (latitude.length && longitude.length) {
      return {
        latitude: {
          min: min(latitude.map(({ value }) => value)) as number,
          max: max(latitude.map(({ value }) => value)) as number,
        },
        longitude: {
          min: min(longitude.map(({ value }) => value)) as number,
          max: max(longitude.map(({ value }) => value)) as number,
        },
      };
    } else return;
  }, [latitude, longitude]);

  const selectedPlot = useMemo(
    () => (selectedPlotId && allPlots?.[selectedPlotId]) || undefined,
    [selectedPlotId, allPlots]
  );
  const selectedPlotCensus = useMemo(
    () =>
      (selectedPlotCensusId && allPlotCensuses?.[selectedPlotCensusId]) ||
      undefined,
    [selectedPlotCensusId, allPlotCensuses]
  );

  const plotArray = useMemo(() => Object.values(allPlots), [allPlots]);
  const plots = usePlotsInRegion(plotArray, regionSnapshot);
  const numTrees = useMemo(() => Object.keys(allTrees).length, [allTrees]);
  const density = useMemo(() => {
    if (plots.length <= Math.pow(5, 2)) {
      return 1;
    } else if (plots.length <= Math.pow(7, 2)) {
      return 1 / 2;
    } else if (plots.length <= Math.pow(9, 2)) {
      return 1 / 3;
    } else if (plots.length <= Math.pow(13, 2)) {
      return 1 / 6;
    } else if (plots.length <= Math.pow(15, 2)) {
      return 1 / 8;
    } else if (plots.length <= Math.pow(17, 2)) {
      return 1 / 10;
    } else if (plots.length <= Math.pow(19, 2)) {
      return 1 / 12;
    } else {
      return 1 / numTrees;
    }
  }, [plots.length, numTrees]);

  const trees = useMemo(() => Object.values(allTrees), [allTrees]);

  // const trees = useMemo<Tree[]>(() => [], []);

  const selectPlotAndCensus = useCallback(
    async (plotId: string) => {
      dispatch(selectPlot(plotId));
      if (plotId in plotCensusesByActivePlot) {
        dispatch(selectPlotCensus(plotCensusesByActivePlot[plotId]));
      }
    },
    [plotCensusesByActivePlot, dispatch]
  );

  const deselectPlotAndCensus = useCallback(async () => {
    dispatch(deselectPlot());
    dispatch(deselectPlotCensus());
  }, [dispatch]);

  const openVisualizationModal = useCallback(() => {
    setVisualizationConfig((prev: VisualizationConfigType) => ({
      ...prev,
      modalOpen: true,
    }));
  }, [setVisualizationConfig]);

  const closeVisualizationModal = useCallback(() => {
    setVisualizationConfig((prev: VisualizationConfigType) => ({
      ...prev,
      modalOpen: false,
    }));
  }, [setVisualizationConfig]);

  const findTree = useCallback(
    async (treeTag: string) => {
      const tree = allTrees[byTag[treeTag]];

      if (tree) {
        dispatch(selectTree(tree.id));
        const plot = tree.plotId;
        if (plot) {
          await selectPlotAndCensus(plot);
          const { easting, northing, zoneNum, zoneLetter } = utm.fromLatLon(
            allPlots[plot].latitude,
            allPlots[plot].longitude
          );
          const { width, length } = allPlots[plot];
          const focusToPlotRegion = {
            ...utm.toLatLon(
              easting + width / 2,
              northing - length / 2,
              zoneNum,
              zoneLetter
            ),
            latitudeDelta: MIN_REGION_DELTA,
            longitudeDelta: MIN_REGION_DELTA,
          };
          mapRef.current?.animateToRegion(focusToPlotRegion, 500);
          setRegionSnapshot(focusToPlotRegion);
        }
      } else {
        alert(
          "A tree with that tag could not be found. Please try a different tag and try again."
        );
      }
    },
    [allPlots, allTrees, byTag, dispatch, selectPlotAndCensus]
  );

  const treeNodes = useMemo(() => {
    setSpeciesFrequencyMap({});
    // This ternary expression ensures that the selected tree is at the end of the list and is therefore rendered on top of others
    return trees.map((tree: Tree, i) => {
      if (
        tree?.latitude &&
        tree?.longitude &&
        (tree.id !== selectedTreeId || i !== trees.length)
      ) {
        const selected = selectedTreeId === tree.id;
        const activeCensus = allTreeCensuses[byTreeActive[tree.id]];
        let nodeColor = visualizationConfig.satellite
          ? Colors.neutral[1]
          : Colors.primary.normal;
        if (visualizationConfig.colorBySpecies) {
          const { speciesCode } = tree;
          if (speciesCode) {
            nodeColor = colorMap[speciesCode];
          }
        }
        const treePixelSize =
          (activeCensus?.dbh ?? DEFAULT_DBH) *
          0.01 *
          0.5 *
          FOLIAGE_MAGNIFICATION;
        return (
          <Circle
            key={tree.id}
            center={{
              latitude: tree.latitude,
              longitude: tree.longitude,
            }}
            radius={selected ? Math.max(1.5, treePixelSize) : treePixelSize}
            strokeColor={selected ? Colors.highlight : nodeColor}
            fillColor={selected ? Colors.highlight : nodeColor}
            zIndex={selected ? 50 : 2}
          ></Circle>
        );
      }
    });
  }, [
    // trees,
    allTrees,
    visualizationConfig.colorBySpecies,
    visualizationConfig.satellite,
    colorMap,
    selectedTreeId,
    byTreeActive,
    allTreeCensuses,
  ]);

  const plotIdColorMap = useCallback(
    (id: string) => {
      if (plotCensusesByActivePlot?.[id]) {
        const status = allPlotCensuses[plotCensusesByActivePlot[id]].status;
        return status ? plotCensusColorMap[status] : "rgba(255, 255, 255, 0.3)";
      }
      return "rgba(255, 255, 255, 0.3)";
    },
    [allPlotCensuses, plotCensusesByActivePlot]
  );

  const computePlotLastUpdatedDate = useCallback(
    (plotId: string) => {
      const plotTrees = byPlots?.[plotId] || [];
      let latestCensus: Date | undefined;
      for (const treeTag of plotTrees) {
        const { updatedAt } = allTrees[treeTag];
        if (updatedAt && (!latestCensus || updatedAt > latestCensus)) {
          latestCensus = updatedAt;
        }
      }
      return latestCensus;
    },
    [byPlots, allTrees]
  );

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === PermissionStatus.UNDETERMINED) {
        setLocationPermissionStatus(
          (await Location.requestForegroundPermissionsAsync()).status
        );
      } else {
        setLocationPermissionStatus(status);
      }
    })();
  }, []);

  const beginPlotting = useCallback(
    (plot) => {
      dispatch(selectPlot(plot.id));
      dispatch(selectPlotCensus(plotCensusesByActivePlot[plot.id]));
      navigation.navigate("plot", { mode: viewMode });
    },
    [navigation, dispatch, plotCensusesByActivePlot, viewMode]
  );

  const switchMode = useCallback(() => {
    switch (viewMode) {
      case MapScreenModes.Explore:
        setViewMode(MapScreenModes.Plot);
        break;
      case MapScreenModes.Plot:
        setViewMode(MapScreenModes.Explore);
        break;
    }
  }, [viewMode, setViewMode, navigation]);

  const getCurrentLocation = useCallback(async () => {
    Location.getCurrentPositionAsync()
      .then(({ coords }) => {
        setUserPos({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      })
      .catch((e) => {
        console.error(e);
      });
  }, [setUserPos]);

  const plotLastUpdatedDate = useMemo(() => {
    let latestCensus: Date | undefined;
    if (selectedPlot) {
      latestCensus = computePlotLastUpdatedDate(selectedPlot.id);
    }
    return latestCensus;
  }, [selectedPlot, computePlotLastUpdatedDate]);

  const openSelectedPlot = useCallback(() => {
    if (!selectedPlot) return;
    const { easting, northing, zoneNum, zoneLetter } = utm.fromLatLon(
      selectedPlot.latitude,
      selectedPlot.longitude
    );
    const { width, length } = selectedPlot;
    const focusToPlotRegion = {
      ...utm.toLatLon(
        easting + width / 2,
        northing - length / 2,
        zoneNum,
        zoneLetter
      ),
      latitudeDelta: MIN_REGION_DELTA,
      longitudeDelta: MIN_REGION_DELTA,
    };
    mapRef.current?.animateToRegion(focusToPlotRegion, 500);
    setRegionSnapshot(focusToPlotRegion);
    setTimeout(() => {
      beginPlotting(selectedPlot);
    }, 250);
  }, [selectedPlot, mapRef, setRegionSnapshot, beginPlotting]);

  return (
    <>
      {loadingTasks && loadingTasks.size > 0 && (
        <LoadingOverlay isBackArrow={showUI}>
          {loadingTasks.values().next().value}
        </LoadingOverlay>
      )}
      <MapView
        style={styles.map}
        userInterfaceStyle='light'
        ref={mapRef}
        mapPadding={{
          top: 24,
          right: 24,
          bottom: 24,
          left: 24,
        }}
        // provider="google"
        mapType={visualizationConfig.satellite ? "satellite" : "standard"}
        showsCompass={true}
        showsScale={true}
        onMapReady={() => {
          if (locationPermissionStatus === PermissionStatus.GRANTED) {
            getCurrentLocation();
          }
        }}
        initialRegion={
          regionSnapshot ??
          (forestBoundaries && {
            latitude:
              (forestBoundaries.latitude.max + forestBoundaries.latitude.min) /
              2,
            longitude:
              (forestBoundaries.longitude.max +
                forestBoundaries.longitude.min) /
              2,
            latitudeDelta:
              forestBoundaries.latitude.max - forestBoundaries.latitude.min,
            longitudeDelta:
              forestBoundaries.longitude.max - forestBoundaries.longitude.min,
          })
        }
        onRegionChangeComplete={(region) => {
          if (forestBoundaries) {
            setRegionSnapshot(region);
          }
        }}
        onPress={async (e) => {
          if (confirmationModalOpen) return;
          closeVisualizationModal();
          if (selectedTreeId) dispatch(deselectTree());
          if (selectedTreeCensusId) dispatch(deselectTreeCensus());
          if (!!e.nativeEvent.coordinate && !!selectedPlot) {
            if (
              !geolib.isPointInPolygon(
                e.nativeEvent.coordinate,
                getPlotCorners(selectedPlot)
              )
            ) {
              await deselectPlotAndCensus();
            }
          }
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onUserLocationChange={({ nativeEvent: { coordinate } }) => {
          if (coordinate)
            setUserPos({
              latitude: coordinate.latitude,
              longitude: coordinate.longitude,
            });
        }}
      >
        {selectedPlot && (
          <>
            <Marker
              coordinate={(() => {
                const { easting, northing, zoneNum, zoneLetter } =
                  utm.fromLatLon(selectedPlot.latitude, selectedPlot.longitude);
                return utm.toLatLon(
                  easting + selectedPlot.width / 2,
                  northing,
                  zoneNum,
                  zoneLetter
                );
              })()}
            >
              <Pressable
                style={{
                  backgroundColor: "white",
                  padding: 12,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                }}
                onPress={() => {
                  if (selectedPlot) {
                    if (
                      selectedPlotCensus?.status === "PENDING" ||
                      selectedPlotCensus?.status === "APPROVED"
                    )
                      return;
                    if (
                      !plotCensusesByActivePlot?.[selectedPlot.id] ||
                      allPlotCensuses[
                        plotCensusesByActivePlot?.[selectedPlot.id]
                      ].status === PlotCensusStatuses.Approved
                    ) {
                      setConfirmationModalOpen(true);
                    } else openSelectedPlot();
                  }
                }}
              >
                {selectedPlotCensus?.status === "PENDING" ||
                selectedPlotCensus?.status === "APPROVED" ? null : (
                  <Ionicons name="ios-create-outline" size={24}></Ionicons>
                )}
                <Queue size={12}></Queue>
                <View>
                  <Text variant={TextVariants.Label}>
                    Plot #{selectedPlot.number}
                  </Text>
                  <Text variant={TextVariants.SmallLabel}>
                    {plotLastUpdatedDate
                      ? `Last censused on ${dateformat(
                          plotLastUpdatedDate,
                          "mmm dS, yyyy"
                        )}`
                      : "Never censused"}
                  </Text>
                </View>
              </Pressable>
            </Marker>
            <Polygon
              style={styles.plot}
              coordinates={[
                ...getPlotCorners(selectedPlot),
                getPlotCorners(selectedPlot)[0],
              ]}
              strokeWidth={2}
              strokeColor="rgba(255, 255, 255, 0.6)"
              fillColor="rgba(255, 255, 255, 0.6)"
              tappable={true}
              onPress={async () => deselectPlotAndCensus}
            />
          </>
        )}
        {/* {showTrees && treeNodes} */}
        {viewMode === MapScreenModes.Plot &&
          plots.map((plot) => {
            return (
              <Polygon
                key={plot.id}
                style={styles.plot}
                coordinates={[...getPlotCorners(plot), getPlotCorners(plot)[0]]}
                strokeWidth={2}
                strokeColor="rgba(255, 255, 255, 0.6)"
                fillColor={plotIdColorMap(plot.id)}
                tappable={true}
                onPress={async () => {
                  plot?.id && (await selectPlotAndCensus(plot.id));
                }}
              />
            );
          })}
      </MapView>
      {showUI && (
        <MapOverlay bottom={drawerHeight + 32} right={32}>
          <Ionicons
            name="ios-locate"
            size={32}
            onPress={() => {
              mapRef.current?.animateToRegion({
                latitude: userPos.latitude,
                longitude: userPos.longitude,
                latitudeDelta: MIN_REGION_DELTA,
                longitudeDelta: MIN_REGION_DELTA,
              });
            }}
          />
        </MapOverlay>
      )}
      {showUI && (
        <MapOverlay top={32} left={32}>
          <Ionicons
            name="ios-arrow-back"
            size={32}
            onPress={() => {
              navigation.goBack();
            }}
          />
        </MapOverlay>
      )}
      {showUI && (
        <MapOverlay bottom={drawerHeight + 128} left={32}>
          <Ionicons
            name="ios-search"
            size={32}
            onPress={() => {
              setSearchModalOpen(true);
            }}
          />
        </MapOverlay>
      )}
      {showUI && (
        <MapOverlay bottom={drawerHeight + 32} left={32}>
          <Ionicons
            name="ios-settings"
            size={32}
            onPress={openVisualizationModal}
          />
        </MapOverlay>
      )}
      {showUI && (
        <View style={{ position: "absolute", top: 32, right: 32 }}>
          <ModeSwitcher mode={viewMode} switchMode={switchMode}></ModeSwitcher>
        </View>
      )}
      <View style={{ position: "absolute" }}>
        <VisualizationModal
          config={visualizationConfig}
          setConfig={setVisualizationConfig}
          visible={visualizationConfig.modalOpen}
          setVisible={() => {
            setVisualizationConfig((prev) => ({
              ...prev,
              modalOpen: !prev.modalOpen,
            }));
          }}
        />
        {
          <SearchModal
            open={searchModalOpen}
            onExit={() => {
              setSearchModalOpen(false);
            }}
            onSubmit={(searchValue: string) => {
              setSearchModalOpen(false);
              findTree(searchValue);
            }}
          />
        }
      </View>
      <View
        style={{
          position: "absolute",
          left: 32,
          top: 32,
        }}
      >
        {visualizationConfig.colorBySpecies && (
          <ColorKey config={visualizationConfig} />
        )}
      </View>
      {showUI && (
        <PlotDrawer
          mode={MapScreenModes.Explore}
          zoom={MapScreenZoomLevels.Forest}
          drawerState={drawerState}
          setDrawerHeight={setDrawerHeight}
          plot={selectedPlot}
          plotCensus={selectedPlotCensus}
          expandDrawer={() => setDrawerState(DrawerStates.Expanded)}
          minimizeDrawer={() => setDrawerState(DrawerStates.Minimized)}
        ></PlotDrawer>
      )}
      <ConfirmationModal
        title="Assign self to plot?"
        prompt="Would you like to assign yourself to this plot? This will give you the ability to create and edit tree censuses within this plot."
        confirmMessage="Assign Self"
        visible={confirmationModalOpen}
        setVisible={setConfirmationModalOpen}
        onConfirm={async () => {
          setConfirmationModalOpen(false);
          if (!isConnected) {
            alert("You must be online to assign yourself to a plot.");
          } else {
            selectedPlot && (await dispatch(createPlotCensus(selectedPlot.id)));
          }
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.secondary.dark,
    justifyContent: "center",
    alignItems: "center",
  },
  plot: {
    position: "relative",
  },
  mapOverlay: {
    position: "absolute",
    backgroundColor: Colors.blurViewBackground,
    width: 64,
    height: 64,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ForestView;
