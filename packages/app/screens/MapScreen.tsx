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
import ColorKey from "../components/ColorKey";
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
import VisualizationModal from "../components/VisualizationModal";
import { VisualizationConfigType } from "../types";

const O_FARM_LAT = 43.7348569458618;
const O_FARM_LNG = -72.2519099587406;
const O_FARM_UMT_EAST = 721308.35;
const O_FARM_UMT_NORTH = 4846095.2;
const O_FARM_UMT_NUM = 18;
const MIN_REGION_DELTA = 0.000005;
const FOLIAGE_MAGNIFICATION = 3;

export default function MapScreen() {
  const dispatch = useAppDispatch();

  // For testing purposes - change this depending on the forest id created by the backend seeder
  const tempForestId = "499a51a6-0d4e-4c07-87d4-c35f81e7e2be"

  useEffect(() => {
    dispatch(getForest({ id: tempForestId }));
    dispatch(
      getForestPlots({ forestId: tempForestId })
    );
    dispatch(
      getForestTrees({
        forestId: tempForestId,
        limit: 1000,
      })
    );
  }, []);

  const mapRef = useRef<MapView>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] =
    useState<PermissionStatus>();
  const [regionSnapshot, setRegionSnapshot] = useState<Region>();

  const plots = usePlots({ viewingBox: regionSnapshot });

  const { drafts = [], selected, indices: {bySpecies}, all } = useAppSelector(
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
    DrawerStates.Minimized
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
    setMode(MapScreenModes.Select)
    setDrawerState(DrawerStates.Minimized);
  }, []);

  const deSelectPlot = useCallback(() => {
    setSelectedPlot(undefined);
    setSelectedPlotIndices(undefined);
    setMode(MapScreenModes.Explore)
    // setDrawerState(DrawerStates.Minimized);
  }, []);

  const beginPlotting = useCallback(() => {
    setMode(MapScreenModes.Plot);
  }, []);

  const endPlotting = useCallback(() => {
    setMode(MapScreenModes.Select);
    setDrawerState(DrawerStates.Minimized);
    setRegionSnapshot(undefined)
  }, [setMode, setDrawerState,setRegionSnapshot]);

  const [visualizationConfig, setVisualizationConfig] = useState<VisualizationConfigType>({modalOpen:false, colorBySpecies:false, speciesColorMap:{}})

  const openVisualizationModal = useCallback(()=>{
    setVisualizationConfig((prev:VisualizationConfigType)=>({...prev, modalOpen:true}))
  }, [setVisualizationConfig])

  const closeVisualizationModal = useCallback(()=>{
    setVisualizationConfig((prev:VisualizationConfigType)=>({...prev,modalOpen:false}))
  },[setVisualizationConfig])

  const [speciesFrequencyMap, setSpeciesFrequencyMap] = useState<{[species:string]:number}>({})

  const treeNodes = useMemo(()=>{
    return trees.map((tree) => {
      if (!!tree.latitude && !!tree.longitude) {
        if (visualizationConfig.colorBySpecies && !Object.keys(visualizationConfig.speciesColorMap).includes(tree.speciesCode)) {
            let uniqueHue: string;
            // this is a poor way to do this, change later
            do {
              uniqueHue= `hsl(${Math.round(Math.random()*360)},80%,40%)`
            } while (Object.values(visualizationConfig.speciesColorMap).includes(uniqueHue))
            setVisualizationConfig((prev)=>({...prev,speciesColorMap:{...prev.speciesColorMap, [tree.speciesCode]:uniqueHue}}))
            // setSpeciesFrequencyMap((prev)=>({...prev, [tree.speciesCode]: 0}))        
        }
        // else setSpeciesFrequencyMap((prev)=>({...prev, [tree.speciesCode]: prev[tree.speciesCode]+1}))
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
            strokeColor={visualizationConfig.colorBySpecies ? visualizationConfig.speciesColorMap[tree.speciesCode] : Colors.primary.dark}
            fillColor={visualizationConfig.colorBySpecies ? visualizationConfig.speciesColorMap[tree.speciesCode] : Colors.primary.dark}
            zIndex={2}
          ></Circle>
        );
      }
    })
  },[trees,visualizationConfig.colorBySpecies, setVisualizationConfig])

  return (
    <View style={styles.container}>
      {mode !== "PLOT" && (
        <>
          <MapView
            style={styles.map}
            ref={mapRef}
            mapPadding={{ top: 24, right: 24, bottom: drawerHeight-24, left: 24 }}
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
              closeVisualizationModal();
              if (mode === "SELECT") {
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
            {treeNodes}
          </MapView>
          <View
            style={{
              ...styles.mapOverlay,
              top: 48,
              right: 12,
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
          <View style={{position:"absolute"}}>
          {visualizationConfig.modalOpen && <VisualizationModal config={visualizationConfig} setConfig={setVisualizationConfig}/>}
          </View>
          <View style={{position:"absolute", left:12, top: 48}}>
          {visualizationConfig.colorBySpecies && <ColorKey config={visualizationConfig}/>}
          </View>
        </>
      )}
      {mode === "PLOT" && (
        <View style={styles.map}>
          <View style={{ ...styles.mapOverlay, top: 32, left: 32 }}>
            <Ionicons
              name="ios-arrow-back"
              size={32}
              onPress={endPlotting}
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
        openVisualizationModal={openVisualizationModal}
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
});
