import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
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
import { Plot, Tree } from "@ong-forestry/schema";

import { Text, TextVariants } from "../../components/Themed";
import Colors from "../../constants/Colors";
import useAppDispatch from "../../hooks/useAppDispatch";
import { PlotDrawer } from "../../components/PlotDrawer";

import { deselectTree, selectTree } from "../../redux/slices/treeSlice";
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
  VisualizationConfigType,
} from "../../constants";

const O_FARM_LAT = 43.7348569458618;
const O_FARM_LNG = -72.2519099587406;
const MIN_REGION_DELTA = 0.0000005;
const FOLIAGE_MAGNIFICATION = 3;
const NUM_OF_SPECIES = 8;

interface ExploreViewProps {
  selectedPlot?: Plot;
  selectPlot: (plot: Plot) => void;
  deselectPlot: () => void;
  beginPlotting: () => void;
}

const ExploreView: React.FC<ExploreViewProps> = (props) => {
  const { selectedPlot, selectPlot, deselectPlot, beginPlotting } = props;

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
  const { all: allTrees, selected: selectedTree } = reduxState.trees;
  const { all: allPlots } = reduxState.plots;
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
    },
    [allPlots, allTrees, dispatch, selectPlot]
  );

  const treeNodes = useMemo(() => {
    setSpeciesFrequencyMap({});
    return trees.map((tree: Tree) => {
      if (!!tree.latitude && !!tree.longitude) {
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
          (tree.dbh ?? DEFAULT_DBH) * 0.01 * 0.5 * FOLIAGE_MAGNIFICATION;
        return (
          <Circle
            key={tree.tag}
            center={{
              latitude: tree.latitude,
              longitude: tree.longitude,
            }}
            radius={treePixelSize}
            strokeColor={selected ? Colors.highlight : nodeColor}
            strokeWidth={4}
            fillColor={nodeColor}
            zIndex={selected ? 50 : 2}
          ></Circle>
        );
      }
    });
  }, [
    trees,
    visualizationConfig.colorBySpecies,
    visualizationConfig.satellite,
    colorMap,
    selectedTree,
  ]);

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
              onPress={deselectPlot}
            />
          </>
        )}
        {plots.map((plot) => {
          return (
            <Polygon
              key={plot.number}
              style={styles.plot}
              coordinates={[...getPlotCorners(plot), getPlotCorners(plot)[0]]}
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
      <PlotDrawer
        mode={selectedPlot ? MapScreenModes.Select : MapScreenModes.Explore}
        drawerState={drawerState}
        setDrawerHeight={setDrawerHeight}
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
        expandDrawer={() => setDrawerState(DrawerStates.Expanded)}
        minimizeDrawer={() => setDrawerState(DrawerStates.Minimized)}
      ></PlotDrawer>
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
  plotCallout: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 8,
  },
  mapOverlay: {
    position: "absolute",
    backgroundColor: "white",
    width: 64,
    height: 64,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ExploreView;
