import { useCallback, useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useIsConnected } from "react-native-offline";
import { PermissionStatus } from "expo-modules-core";
import { MapScreenModes } from "../../constants";
import useAppDispatch from "../../hooks/useAppDispatch";
import { getForest } from "../../redux/slices/forestSlice";
import { getForestPlots } from "../../redux/slices/plotSlice";
import { deselectTree, getForestTrees } from "../../redux/slices/treeSlice";
import { FOREST_ID } from "../../constants/dev";
import { getAllTreeSpecies } from "../../redux/slices/treeSpeciesSlice";
import { getAllTreeLabels } from "../../redux/slices/treeLabelSlice";
import PlotView from "./PlotView";
import ExploreView from "./ExploreView";
import { getAllTreePhotoPurposes } from "../../redux/slices/treePhotoPurposeSlice";
import { getForestForestCensuses } from "../../redux/slices/forestCensusSlice";
import useAppSelector from "../../hooks/useAppSelector";
import { deselectTreeCensus } from "../../redux/slices/treeCensusSlice";
import { uploadCensusData } from "../../redux/slices/syncSlice";
import PhotoPermissionContext, {
  defaultPhotoPermissionContext,
} from "../../context/PhotoPermissionContext";
import Colors from "../../constants/Colors";
import { Text } from "../../components/Themed";

export default function MapScreen() {
  const dispatch = useAppDispatch();
  // const isConnected = useIsConnected();
  const isConnected = false;
  const { rehydrated: treeRehydrated } = useAppSelector((state) => state.trees);
  const { rehydrated: treeCensusRehydrated } = useAppSelector(
    (state) => state.treeCensuses
  );
  const { rehydrated: treePhotosRehydrated } = useAppSelector(
    (state) => state.treePhotos
  );

  useEffect(() => {
    if (
      true
      // isConnected
      // && treeRehydrated &&
      // treeCensusRehydrated &&
      // treePhotosRehydrated
    ) {
      // dispatch(uploadCensusData()).then(() => {
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
      // });
    }
  }, [
    dispatch,
    // isConnected,
    // treeRehydrated,
    // treeCensusRehydrated,
    // treePhotosRehydrated,
  ]);

  const [photoPermissionStatus, setPhotoPermissionStatus] =
    useState<PermissionStatus>(defaultPhotoPermissionContext.status);

  const { selected: selectedPlot } = useAppSelector((state) => state.plots);

  const [mode, setMode] = useState<MapScreenModes>(MapScreenModes.Explore);

  const beginPlotting = useCallback(() => {
    setMode(MapScreenModes.Plot);
  }, [setMode]);

  const endPlotting = useCallback(() => {
    dispatch(deselectTree());
    dispatch(deselectTreeCensus());
    setMode(MapScreenModes.Select);
  }, [setMode, dispatch]);

  return (
    <PhotoPermissionContext.Provider
      value={{
        status: photoPermissionStatus,
        setStatus: setPhotoPermissionStatus,
      }}
    >
      {/* {!isConnected && (
        <View style={styles.offlineBar}>
          <Text style={styles.offlineText}>
            You are currently offline. Your changes will be saved once you
            reconnect.
          </Text>
        </View>
      )} */}
      <View style={styles.container}>
        {mode !== "PLOT" && (
          <ExploreView
            // selectedForestCensus={}
            setMode={setMode}
            beginPlotting={beginPlotting}
          />
        )}
        {mode === "PLOT" && selectedPlot && (
          <PlotView
            onExit={() => {
              setMode(MapScreenModes.Explore);
              endPlotting();
            }}
            endPlotting={endPlotting}
          />
        )}
      </View>
    </PhotoPermissionContext.Provider>
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
  offlineBar: {
    backgroundColor: Colors.error,
    height: 24,
    width: "100%",
  },
  offlineText: {
    width: "100%",
    textAlign: "center",
    fontSize: 12,
    marginTop: 2,
    color: "white",
    position: "absolute",
  },
});
