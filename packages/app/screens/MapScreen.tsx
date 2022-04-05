import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import MapView, {
  Marker,
  Region,
  LatLng,
  Polygon,
  Circle,
} from "react-native-maps";
import * as Location from "expo-location";
import { PermissionStatus } from "expo-modules-core";
import * as geolib from "geolib";
import { Ionicons } from "@expo/vector-icons";
import * as utm from "utm";
import { Plot, Tree } from "@ong-forestry/schema";

import { Text, TextVariants } from "../components/Themed";
import { PlotDrawer } from "../components/PlotDrawer";
import { PlottingSheet } from "../components/PlottingSheet";
import {
  DEFAULT_DBH,
  DrawerStates,
  MapScreenModes,
  VisualizationConfigType,
} from "../constants";
import Colors from "../constants/Colors";
import useAppDispatch from "../hooks/useAppDispatch";
import useAppSelector, {
  usePlots,
  usePlotsInRegion,
  useTreesByDensity,
  useTreesInRegion,
} from "../hooks/useAppSelector";

import { RootState } from "../redux";
import { getForest } from "../redux/slices/forestSlice";
import { getForestPlots } from "../redux/slices/plotSlice";
import {
  deselectTree,
  getForestTrees,
  selectTree,
} from "../redux/slices/treeSlice";
import {
  formPlotNumber,
  getPlotCorners,
  parsePlotNumber,
} from "../constants/plots";
import VisualizationModal from "../components/VisualizationModal";
import ColorKey from "../components/ColorKey";
import { FOREST_ID } from "../constants/dev";
import { getAllTreeSpecies } from "../redux/slices/treeSpeciesSlice";

const O_FARM_LAT = 43.7348569458618;
const O_FARM_LNG = -72.2519099587406;
const MIN_REGION_DELTA = 0.0000005;
const FOLIAGE_MAGNIFICATION = 3;
const SELECTED_MAGNIFICATION = 5;
const NUM_OF_SPECIES = 8;

export default function MapScreen() {
  // map setup
  const mapRef = useRef<MapView>(null);
  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      console.log(`Location foreground permission status ${status}.`);
      if (status === PermissionStatus.UNDETERMINED) {
        setLocationPermissionStatus(
          (await Location.requestForegroundPermissionsAsync()).status
        );
      } else {
        setLocationPermissionStatus(status);
      }
    })();
  }, []);
  const [locationPermissionStatus, setLocationPermissionStatus] =
    useState<PermissionStatus>();
  const [regionSnapshot, setRegionSnapshot] = useState<Region>();

  // redux actions and store selectors
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getForest({ id: FOREST_ID }));
    dispatch(getForestPlots({ forestId: FOREST_ID }));
    dispatch(
      getForestTrees({
        forestId: FOREST_ID,
      })
    );
    dispatch(getAllTreeSpecies());
  }, []);
  const reduxState = useAppSelector((state: RootState) => state);
  const { all: allPlots } = reduxState.plots;
  const { all: allTrees, selected: selectedTree } = reduxState.trees;
  const { colorMap } = reduxState.treeSpecies;
  const plots = usePlotsInRegion(usePlots(reduxState), regionSnapshot);
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
      return 1 / Object.keys(allTrees).length;
    }
  }, [plots.length]);
  const trees = useTreesInRegion(
    useTreesByDensity(reduxState, density),
    regionSnapshot
  );

  // component states
  const [mode, setMode] = useState<MapScreenModes>(MapScreenModes.Explore);
  const [drawerState, setDrawerState] = useState<DrawerStates>(
    DrawerStates.Minimized
  );
  const [drawerHeight, setDrawerHeight] = useState(0);
  const [userPos, setUserPos] = useState<LatLng>({
    latitude: O_FARM_LAT,
    longitude: O_FARM_LNG,
  });
  const [selectedPlot, setSelectedPlot] = useState<Plot>();
  const [selectedPlotIndices, setSelectedPlotIndices] =
    useState<{ i: number; j: number }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // component functions
  const selectPlot = useCallback((plot: Plot) => {
    setSelectedPlot(plot);
    const i = parseInt(plot.number.substring(0, 2));
    const j = parseInt(plot.number.substring(2, 4));
    setSelectedPlotIndices({ i, j });
    setMode(MapScreenModes.Select);
    setDrawerState(DrawerStates.Minimized);
  }, []);

  const deSelectPlot = useCallback(() => {
    setSelectedPlot(undefined);
    setSelectedPlotIndices(undefined);
    setMode(MapScreenModes.Explore);
    setDrawerState(DrawerStates.Minimized);
  }, []);

  const beginPlotting = useCallback(() => {
    dispatch(deselectTree());
    setMode(MapScreenModes.Plot);
  }, []);

  const endPlotting = useCallback(() => {
    dispatch(deselectTree());
    setMode(MapScreenModes.Select);
    setDrawerState(DrawerStates.Minimized);
  }, [setMode, setDrawerState, setRegionSnapshot]);

  const [visualizationConfig, setVisualizationConfig] =
    useState<VisualizationConfigType>({
      modalOpen: false,
      colorBySpecies: false,
      numOfSpecies: NUM_OF_SPECIES,
      satellite: false,
    });

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

  const [_speciesFrequencyMap, setSpeciesFrequencyMap] = useState<{
    [species: string]: number;
  }>({});

  const findTree = useCallback((treeTag: string) => {
    const tree = allTrees[treeTag];
    if (tree) {
      dispatch(selectTree(tree.tag));
      const plot = tree.plotNumber;
      if (plot) {
        selectPlot(allPlots[plot]);
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
    }
  }, []);

  const treeNodes = useMemo(() => {
    setSpeciesFrequencyMap({});
    return trees.map((tree: Tree) => {
      if (!!tree.latitude && !!tree.longitude) {
        const selected = selectedTree === tree.tag;
        let nodeColor = selected ? Colors.error : Colors.primary.normal;
        if (visualizationConfig.colorBySpecies) {
          const { speciesCode } = tree;
          if (speciesCode) {
            nodeColor = colorMap[speciesCode];
          }
        }
        let treePixelSize =
          (tree.dbh ?? DEFAULT_DBH) * 0.01 * 0.5 * FOLIAGE_MAGNIFICATION;
        if (selected) {
          treePixelSize *= SELECTED_MAGNIFICATION;
        }
        return (
          <Circle
            key={tree.tag}
            center={{
              latitude: tree.latitude,
              longitude: tree.longitude,
            }}
            radius={treePixelSize}
            strokeColor={nodeColor}
            fillColor={nodeColor}
            zIndex={2}
          ></Circle>
        );
      }
    });
  }, [trees, visualizationConfig.colorBySpecies]);

  return (
    <View style={styles.container}>
      {mode !== "PLOT" && (
        <>
          <MapView
            style={styles.map}
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
                console.log(
                  "locationPermissionStatus",
                  locationPermissionStatus === PermissionStatus.GRANTED
                );
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
              }
            }}
            initialRegion={
              regionSnapshot ?? {
                latitude: O_FARM_LAT,
                longitude: O_FARM_LNG,
                latitudeDelta: MIN_REGION_DELTA,
                longitudeDelta: MIN_REGION_DELTA,
              }
            }
            onRegionChangeComplete={(region) => {
              setRegionSnapshot(region);
            }}
            onPress={(e) => {
              closeVisualizationModal();
              dispatch(deselectTree());
              if (!!e.nativeEvent.coordinate && !!selectedPlot) {
                if (
                  !geolib.isPointInPolygon(
                    e.nativeEvent.coordinate,
                    getPlotCorners(selectedPlot)
                  )
                ) {
                  deSelectPlot();
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
            {!!selectedPlot && (
              <>
                <Marker
                  coordinate={(() => {
                    const { easting, northing, zoneNum, zoneLetter } =
                      utm.fromLatLon(
                        selectedPlot.latitude,
                        selectedPlot.longitude
                      );
                    return utm.toLatLon(
                      easting + selectedPlot.width / 2,
                      northing,
                      zoneNum,
                      zoneLetter
                    );
                  })()}
                >
                  <View style={styles.plotCallout}>
                    <Text variant={TextVariants.Body}>
                      Plot #{selectedPlot.number}
                    </Text>
                  </View>
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
                  onPress={deSelectPlot}
                />
              </>
            )}
            {plots.map((plot) => {
              return (
                <Polygon
                  key={plot.number}
                  style={styles.plot}
                  coordinates={[
                    ...getPlotCorners(plot),
                    getPlotCorners(plot)[0],
                  ]}
                  strokeWidth={2}
                  strokeColor="rgba(255, 255, 255, 0.6)"
                  fillColor="rgba(255, 255, 255, 0.3)"
                  tappable={true}
                  onPress={() => {
                    selectPlot(plot);
                  }}
                />
              );
            })}
            {treeNodes}
          </MapView>
          <View
            style={{
              ...styles.mapOverlay,
              bottom: drawerHeight + 32,
              right: 32,
            }}
          >
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
          </View>
          <View
            style={{
              ...styles.mapOverlay,
              bottom: drawerHeight + 128,
              left: 32,
            }}
          >
            <Ionicons
              name="ios-search"
              size={32}
              onPress={() => {
                setSearchModalOpen(true);
              }}
            />
          </View>
          <View
            style={{
              ...styles.mapOverlay,
              bottom: drawerHeight + 32,
              left: 32,
            }}
          >
            <Ionicons
              name="ios-settings"
              size={32}
              onPress={openVisualizationModal}
            />
          </View>
          <View style={{ position: "absolute" }}>
            {visualizationConfig.modalOpen && (
              <VisualizationModal
                config={visualizationConfig}
                setConfig={setVisualizationConfig}
              />
            )}
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
        </>
      )}
      {mode === "PLOT" && (
        <View style={styles.map}>
          <View style={{ ...styles.mapOverlay, top: 32, left: 32 }}>
            <Ionicons
              name="ios-arrow-back"
              size={32}
              onPress={() => {
                setMode(MapScreenModes.Explore);
                setDrawerState(DrawerStates.Minimized);
                endPlotting();
              }}
            />
          </View>
          {!!plots && !!selectedPlot && !!selectedPlotIndices && (
            <PlottingSheet
              plot={selectedPlot}
              stakeNames={(() => {
                const { i, j } = parsePlotNumber(selectedPlot.number);
                const stakeNames = [];
                stakeNames.push(selectedPlot.number);
                if (formPlotNumber(i + 1, j) in allPlots) {
                  stakeNames.push(allPlots[formPlotNumber(i + 1, j)].number);
                } else {
                  stakeNames.push("No stake");
                }
                if (formPlotNumber(i + 1, j + 1) in allPlots) {
                  stakeNames.push(
                    allPlots[formPlotNumber(i + 1, j + 1)].number
                  );
                } else {
                  stakeNames.push("No stake");
                }
                if (formPlotNumber(i, j + 1) in allPlots) {
                  stakeNames.push(allPlots[formPlotNumber(i, j + 1)].number);
                } else {
                  stakeNames.push("No stake");
                }
                return stakeNames;
              })()}
              mapWidth={Dimensions.get("window").width}
              expandDrawer={() => setDrawerState(DrawerStates.Expanded)}
              minimizeDrawer={() => setDrawerState(DrawerStates.Minimized)}
            />
          )}
        </View>
      )}
      <PlotDrawer
        mode={mode}
        drawerState={drawerState}
        setDrawerHeight={setDrawerHeight}
        openVisualizationModal={openVisualizationModal}
        plot={selectedPlot}
        beginPlotting={() => {
          if (selectedPlot) {
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
            setTimeout(() => beginPlotting(), 500);
          }
        }}
        endPlotting={endPlotting}
        expandDrawer={() => setDrawerState(DrawerStates.Expanded)}
        minimizeDrawer={() => setDrawerState(DrawerStates.Minimized)}
      ></PlotDrawer>
      <Modal visible={searchModalOpen} transparent={true} animationType="fade">
        <Pressable
          style={styles.centeredView}
          onPress={() => setSearchModalOpen(false)}
        >
          <View style={[styles.modal, styles.modalContainer]}>
            <TextInput
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
              onSubmitEditing={() => {
                setSearchModalOpen(false);
                findTree(searchQuery);
                setSearchQuery("");
              }}
              placeholder="Search for a tree by tag #"
              returnKeyType="search"
              style={{ width: 256 }}
              autoFocus={true}
            ></TextInput>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  map: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.secondary.dark,
    justifyContent: "center",
    alignItems: "center",
  },
  trees: {},
  plot: {
    position: "relative",
  },
  plotLabel: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  plotCallout: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 8,
  },
  // TODO: use SafeAreaView for overlay
  mapOverlay: {
    position: "absolute",
    backgroundColor: "white",
    width: 64,
    height: 64,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    alignSelf: "center",
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
