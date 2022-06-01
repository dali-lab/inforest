import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { selectForestCensus } from "../../redux/slices/forestCensusSlice";
import { getPlotCorners } from "../../constants/plots";
import VisualizationModal from "../../components/VisualizationModal";
import SearchModal from "../../components/SearchModal";
import ColorKey from "../../components/ColorKey";
import useAppSelector, {
  usePlots,
  usePlotsInRegion,
  useTreesByDensity,
  useTreesInRegion,
} from "../../hooks/useAppSelector";
import { RootState } from "../../redux";

import {
  DEFAULT_DBH,
  DrawerStates,
  MapScreenModes,
  MapScreenZoomLevels,
  VisualizationConfigType,
} from "../../constants";
import { getForestCensusPlotCensuses } from "../../redux/slices/plotCensusSlice";
import { useNavigation, useRoute } from "@react-navigation/native";
import { max, min } from "lodash";
import { MapOverlay } from "../../components/MapOverlay";
import { ModeSwitcher } from "./ModeSwitcher";
import { Queue } from "react-native-spacing-system";
import Color from "color";

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
  switchMode: () => void;
  selectedPlot?: Plot;
  selectPlot: (plot: Plot) => void;
  deselectPlot: () => void;
  beginPlotting: (plot: Plot) => void;
  showUI?: boolean;
  showTrees?: boolean;
};

const ForestView: React.FC<ForestViewProps> = (props) => {
  const {
    mode,
    switchMode,
    selectedPlot,
    selectPlot,
    deselectPlot,
    beginPlotting,
    showUI = true,
    showTrees = true,
  } = props;

  const navigate = useNavigation();

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [regionSnapshot, setRegionSnapshot] = useState<Region>();
  const [drawerHeight, setDrawerHeight] = useState(0);
  const [drawerState, setDrawerState] = useState<DrawerStates>(
    DrawerStates.Minimized
  );

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
    selected: selectedTree,
    indices: { byPlots },
  } = reduxState.trees;
  const {
    all: allTreeCensuses,
    indices: { byPlotCensuses },
  } = reduxState.treeCensuses;
  const { all: allPlots, indices: plotIndices } = reduxState.plots;
  const { all: allForestCensuses, selected: selectedForestCensus } =
    reduxState.forestCensuses;
  const {
    indices: { byPlots: plotCensusesByPlot },
  } = reduxState.plotCensuses;
  const { colorMap } = reduxState.treeSpecies;

  const plots = usePlotsInRegion(usePlots(reduxState), regionSnapshot);
  const forestBoundaries = useMemo(() => {
    if (plotIndices.latitude.length && plotIndices.longitude.length) {
      return {
        latitude: {
          min: min(plotIndices.latitude.map(({ value }) => value)) as number,
          max: max(plotIndices.latitude.map(({ value }) => value)) as number,
        },
        longitude: {
          min: min(plotIndices.longitude.map(({ value }) => value)) as number,
          max: max(plotIndices.longitude.map(({ value }) => value)) as number,
        },
      };
    } else return;
  }, [plotIndices]);
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
  }, [plots.length, allTrees]);

  const trees = useTreesInRegion(
    useTreesByDensity(reduxState, density),
    regionSnapshot
  );

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
    (treeTag: string) => {
      const tree = allTrees[treeTag];
      if (tree) {
        dispatch(selectTree(tree.tag));
        const plot = tree.plotId;
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
      } else {
        alert(
          "A tree with that tag could not be found. Please try a different tag and try again."
        );
      }
    },
    [allPlots, allTrees, dispatch, selectPlot]
  );

  const treeNodes = useMemo(() => {
    setSpeciesFrequencyMap({});
    // This ternary expression ensures that the selected tree is at the end of the list and is therefore rendered on top of others
    return (selectedTree ? [...trees, allTrees[selectedTree]] : trees).map(
      (tree: Tree, i) => {
        if (
          !!tree?.latitude &&
          !!tree?.longitude &&
          (tree.tag !== selectedTree || i !== trees.length)
        ) {
          const selected = selectedTree === tree.tag;
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
            (tree?.censuses?.[0]?.dbh ?? DEFAULT_DBH) *
            0.01 *
            0.5 *
            FOLIAGE_MAGNIFICATION;
          return (
            <Circle
              key={tree.tag}
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
      }
    );
  }, [
    allTrees,
    trees,
    visualizationConfig.colorBySpecies,
    visualizationConfig.satellite,
    colorMap,
    selectedTree,
  ]);

  const plotIdColorMap = useCallback(
    (id: string) => {
      if (
        selectedForestCensus?.id &&
        plotCensusesByPlot?.[id]?.[selectedForestCensus?.id]
      ) {
        const status = plotCensusesByPlot[id][selectedForestCensus.id]?.status;
        return status ? plotCensusColorMap[status] : "rgba(255, 255, 255, 0.3)";
      }
      return "rgba(255, 255, 255, 0.3)";
    },
    [selectedForestCensus, plotCensusesByPlot]
  );

  const computePlotLastUpdatedDate = useCallback(
    (plotId: string) => {
      const plotTrees = byPlots[plotId];
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

  const plotLastUpdatedDate = useMemo(() => {
    let latestCensus: Date | undefined;
    if (selectedPlot) {
      latestCensus = computePlotLastUpdatedDate(selectedPlot.id);
      // Object.values(plotCensusesByPlot[selectedPlot.id]).forEach(
      //   (plotCensus) => {
      //     const treeCensuesIds = byPlotCensuses[plotCensus.id];
      //     if (treeCensuesIds) {
      //       for (const treeCensusId of treeCensuesIds) {
      //         const { updatedAt } = allTreeCensuses[treeCensusId];
      //         if (updatedAt && (!latestCensus || updatedAt > latestCensus)) {
      //           latestCensus = updatedAt;
      //         }
      //       }
      //     }
      //   }
      // );
    }
    return latestCensus;
  }, [selectedPlot, allTreeCensuses, plotCensusesByPlot, byPlotCensuses]);

  return (
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
              deselectPlot();
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
                    const { easting, northing, zoneNum, zoneLetter } =
                      utm.fromLatLon(
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
                    }, 500);
                  }
                }}
              >
                <Ionicons name="ios-create-outline" size={24}></Ionicons>
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
              onPress={deselectPlot}
            />
          </>
        )}
        {showTrees && treeNodes}
        {mode === MapScreenModes.Plot &&
          plots.map((plot) => {
            return (
              <Polygon
                key={plot.number}
                style={styles.plot}
                coordinates={[...getPlotCorners(plot), getPlotCorners(plot)[0]]}
                strokeWidth={2}
                strokeColor="rgba(255, 255, 255, 0.6)"
                fillColor={plotIdColorMap(plot.id)}
                tappable={true}
                onPress={() => {
                  plot && selectPlot(plot);
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
              navigate.goBack();
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
          <ModeSwitcher mode={mode} switchMode={switchMode}></ModeSwitcher>
        </View>
      )}
      <View style={{ position: "absolute" }}>
        {visualizationConfig.modalOpen && (
          <VisualizationModal
            config={visualizationConfig}
            setConfig={setVisualizationConfig}
          />
        )}
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
          mode={mode}
          zoom={MapScreenZoomLevels.Forest}
          drawerState={drawerState}
          setDrawerHeight={setDrawerHeight}
          plot={selectedPlot}
          plotCensus={
            (selectedPlot &&
              selectedForestCensus &&
              plotCensusesByPlot?.[selectedPlot?.id]?.[
                selectedForestCensus?.id
              ]) ||
            undefined
          }
          expandDrawer={() => setDrawerState(DrawerStates.Expanded)}
          minimizeDrawer={() => setDrawerState(DrawerStates.Minimized)}
        ></PlotDrawer>
      )}
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
