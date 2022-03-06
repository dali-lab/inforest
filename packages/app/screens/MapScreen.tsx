import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import {
  Alert,
  Button,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import MapView, {
  Marker,
  EventUserLocation,
  Region,
  LatLng,
  Polyline,
  Polygon,
  MapEvent,
  Callout,
  Circle,
} from "react-native-maps";
import * as Location from "expo-location";
import { PermissionStatus } from "expo-modules-core";
import * as geolib from "geolib";
import * as Random from "expo-random";
import { Ionicons } from "@expo/vector-icons";
import * as utm from "utm";
import { Plot, Tree } from "@ong-forestry/schema";

import { Text } from "../components/Themed";
import { PlotDrawer } from "../components/PlotDrawer";
import { PlottingSheet } from "../components/PlottingSheet";
import { useRef } from "react";
import {
  DraftTreesAction,
  DraftTreesState,
  DrawerStates,
  MapScreenModes,
} from "../constants";
import Colors from "../constants/Colors";
import { TreeMarker } from "../components/TreeMarker";
import useAppDispatch from "../hooks/useAppDispatch";
import useAppSelector, {
  useMoreTrees,
  usePlots,
  useTrees,
} from "../hooks/useAppSelector";

import { login } from "../redux/slices/userSlice";
import { RootState } from "../redux";
import { getForest } from "../redux/slices/forestSlice";
import { getForestPlots } from "../redux/slices/plotSlice";
import { getForestTrees } from "../redux/slices/treeSlice";
import {
  formPlotNumber,
  getPlotCorners,
  parsePlotNumber,
} from "../constants/plots";

const O_FARM_LAT = 43.7348569458618;
const O_FARM_LNG = -72.2519099587406;
const O_FARM_UMT_EAST = 721308.35;
const O_FARM_UMT_NORTH = 4846095.2;
const O_FARM_UMT_NUM = 18;
const MIN_REGION_DELTA = 0.000005;
const FOLIAGE_MAGNIFICATION = 3;

export default function MapScreen() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getForest({ id: "499a51a6-0d4e-4c07-87d4-c35f81e7e2be" }));
    dispatch(
      getForestPlots({ forestId: "499a51a6-0d4e-4c07-87d4-c35f81e7e2be" })
    );
    dispatch(
      getForestTrees({
        forestId: "499a51a6-0d4e-4c07-87d4-c35f81e7e2be",
        limit: 1000,
      })
    );
  }, []);

  const mapRef = useRef<MapView>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] =
    useState<PermissionStatus>();
  const [regionSnapshot, setRegionSnapshot] = useState<Region>();

  const plots = usePlots({ viewingBox: regionSnapshot });

  const { drafts = [], selected } = useAppSelector(
    (state: RootState) => state.trees
  );

  const [density, setDensity] = useState(0.1);

  const trees = useTrees(
    useAppSelector((state: RootState) => state),
    {
      density,
      plotNumbers: new Set(Object.keys(plots)),
    }
  );

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

  const [mode, setMode] = useState<MapScreenModes>(MapScreenModes.Explore);
  const [drawerState, setDrawerState] = useState<DrawerStates>(
    DrawerStates.Closed
  );
  const [drawerHeight, setDrawerHeight] = useState(0);
  const [userPos, setUserPos] = useState<{
    latitude: number;
    longitude: number;
    utm: {
      easting: number;
      northing: number;
      zoneNum: number;
      zoneLetter: string;
    };
  }>({
    latitude: O_FARM_LAT,
    longitude: O_FARM_LNG,
    utm: {
      easting: O_FARM_UMT_EAST,
      northing: O_FARM_UMT_NORTH,
      zoneNum: O_FARM_UMT_NUM,
      zoneLetter: "T",
    },
  });
  const [selectedPlot, setSelectedPlot] = useState<Plot>();
  const [selectedPlotIndices, setSelectedPlotIndices] =
    useState<{ i: number; j: number }>();

  const selectPlot = useCallback((plot: Plot) => {
    setSelectedPlot(plot);
    const i = parseInt(plot.number.substring(0, 2));
    const j = parseInt(plot.number.substring(2, 4));
    setSelectedPlotIndices({ i, j });
    setDrawerState(DrawerStates.Minimized);
  }, []);

  const deSelectPlot = useCallback(() => {
    setSelectedPlot(undefined);
    setSelectedPlotIndices(undefined);
    setDrawerState(DrawerStates.Closed);
  }, []);

  const beginPlotting = useCallback(() => {
    setMode(MapScreenModes.Plot);
  }, []);

  const endPlotting = useCallback(() => {
    setMode(MapScreenModes.Explore);
    setDrawerState(DrawerStates.Minimized);
  }, []);

  return (
    <View style={styles.container}>
      {mode === "EXPLORE" && (
        <>
          <MapView
            style={styles.map}
            ref={mapRef}
            mapPadding={{ top: 24, right: 24, bottom: 0, left: 24 }}
            // provider="google"
            // mapType='satellite'
            showsCompass={true}
            showsScale={true}
            scrollEnabled={mode === "EXPLORE"}
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
                      utm: utm.fromLatLon(coords.latitude, coords.longitude),
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
              mapRef.current?.getCamera().then((camera) => {
                const DENSITY_ONE_THIRD = 377;
                const DENSITY_TWO_THIRDS = 517;
                if (camera.altitude < DENSITY_ONE_THIRD) {
                  setDensity(0.4);
                } else if (camera.altitude < DENSITY_TWO_THIRDS) {
                  setDensity(0.2);
                } else {
                  setDensity(0.1);
                }
              });
            }}
            onPress={(e) => {
              if (mode === "EXPLORE") {
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
              } else if (mode === "PLOT") {
                const { latitude, longitude } = e.nativeEvent.coordinate;
              }
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            // followsUserLocation={true}
            onUserLocationChange={({ nativeEvent: { coordinate } }) => {
              // setUserPos({
              //   latitude: coordinate.latitude,
              //   longitude: coordinate.longitude,
              //   utm: utm.fromLatLon(coordinate.latitude, coordinate.longitude),
              // });
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
                      easting + 10,
                      northing,
                      zoneNum,
                      zoneLetter
                    );
                  })()}
                >
                  <View style={styles.plotCallout}>
                    <Text>Plot #{selectedPlot.number}</Text>
                    {/* <Ionicons name='ios-add-circle-outline' size={24} /> */}
                  </View>
                </Marker>
              </>
            )}
            {Object.values(plots).map((plot) => {
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
                  fillColor={
                    selectedPlot?.number === plot.number
                      ? "rgba(255, 255, 255, 0.6)"
                      : "rgba(255, 255, 255, 0.3)"
                  }
                  tappable={true}
                  onPress={() => {
                    if (!!selectedPlot && selectedPlot.number === plot.number) {
                      deSelectPlot();
                    } else {
                      selectPlot(plot);
                    }
                  }}
                  zIndex={1}
                />
              );
            })}
            {trees.map((tree) => {
              if (!!tree.latitude && !!tree.longitude) {
                const treePixelSize =
                  (tree.dbh ?? 10) * 0.01 * 0.5 * FOLIAGE_MAGNIFICATION;
                return (
                  <Circle
                    key={tree.tag}
                    center={{
                      latitude: tree.latitude,
                      longitude: tree.longitude,
                    }}
                    radius={treePixelSize}
                    strokeColor={Colors.primary.dark}
                    fillColor={Colors.primary.dark}
                    zIndex={2}
                  ></Circle>
                );
              }
            })}
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
                if (formPlotNumber(i + 1, j) in plots) {
                  stakeNames.push(plots[formPlotNumber(i + 1, j)].number);
                }
                if (formPlotNumber(i + 1, j + 1) in plots) {
                  stakeNames.push(plots[formPlotNumber(i + 1, j + 1)].number);
                }
                if (formPlotNumber(i, j + 1) in plots) {
                  stakeNames.push(plots[formPlotNumber(i, j)].number);
                }
                // if (i < plots.length - 1) {
                //   stakeNames.push(plots[i + 1][j].name);
                //   if (j < plots[i].length - 1) {
                //     stakeNames.push(plots[i + 1][j + 1].name);
                //     stakeNames.push(plots[i][j + 1].name);
                //   } else {
                //     stakeNames.push("No stake");
                //     stakeNames.push("No stake");
                //   }
                // } else {
                //   stakeNames.push("No stake");
                //   stakeNames.push("No stake");
                //   if (j < plots[i].length - 1) {
                //     stakeNames.push(plots[i][j + 1].name);
                //   }
                // }
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
        plot={selectedPlot}
        beginPlotting={() => {
          if (selectedPlot) {
            const { easting, northing, zoneNum, zoneLetter } = utm.fromLatLon(
              selectedPlot.latitude,
              selectedPlot.longitude
            );
            const focusToPlotRegion = {
              ...utm.toLatLon(easting + 10, northing - 10, zoneNum, zoneLetter),
              latitudeDelta: MIN_REGION_DELTA,
              longitudeDelta: MIN_REGION_DELTA,
            };
            mapRef.current?.animateToRegion(focusToPlotRegion, 500);
            setRegionSnapshot(focusToPlotRegion);
            setTimeout(() => beginPlotting(), 500);
          }
        }}
        endPlotting={endPlotting}
        minimizeDrawer={() => setDrawerState(DrawerStates.Minimized)}
      ></PlotDrawer>
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
    backgroundColor: Colors.secondary.normal,
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
