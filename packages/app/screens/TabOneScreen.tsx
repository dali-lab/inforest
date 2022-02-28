import { useState, useEffect } from "react";
import { Dimensions, StyleSheet } from "react-native";
import MapView, {
  Marker,
  EventUserLocation,
  Region,
  LatLng,
} from "react-native-maps";

import EditScreenInfo from "../components/EditScreenInfo";
import { Text, View } from "../components/Themed";
import { RootTabScreenProps } from "../types";
import useAppDispatch from "../hooks/useAppDispatch";
import useAppSelector from "../hooks/useAppSelector";

import { login } from "../redux/slices/userSlice";
import { RootState } from "../redux";

export default function TabOneScreen({
  navigation,
}: RootTabScreenProps<"TabOne">) {
  // const [markerPos, setMarkerPos] = useState<EventUserLocation['nativeEvent']['coordinate']>()
  const [markerPos, setMarkerPos] = useState<LatLng>();
  const [region, setRegion] = useState<Region>();
  const dispatch = useAppDispatch();

  dispatch(login({ email: "juliancgeorge@gmail.com", password: "redred" }));
  const credentials = useAppSelector((state: RootState) => state.user.token);
  console.log(credentials);
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: 43.7368_6552,
          longitude: -72.2513_3422,
          latitudeDelta: 0.0002,
          longitudeDelta: 0.0002,
        }}
        scrollEnabled={false}
        // rotateEnabled={false}
        // zoomEnabled={false}
        showsUserLocation={true}
        // onUserLocationChange={({ nativeEvent: {coordinate} }) => setMarkerPos(coordinate)}
        onPress={() => console.log("onPress")}
        onPanDrag={(e) => {
          console.log("onPanDrag", e.nativeEvent.coordinate);
          setMarkerPos(e.nativeEvent.coordinate);
        }}
        onRegionChange={(region) => setRegion(region)}
      >
        {markerPos && (
          <Marker coordinate={markerPos}>
            <View style={styles.marker}>
              {/* <Text>Hello</Text> */}
              <View style={styles.markerPoint} />
              <View style={styles.markerHorizontalAxis}></View>
              <View style={styles.markerVerticalAxis}></View>
            </View>
          </Marker>
        )}
      </MapView>
      <View style={styles.overlay}>
        <Text>Region</Text>
        <Text>{JSON.stringify(region)}</Text>
        <Text>User</Text>
        <Text>{JSON.stringify(markerPos)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  marker: {
    position: "relative",
    overflow: "visible",
  },
  markerPoint: {
    backgroundColor: "black",
    width: 10,
    height: 10,
  },
  markerHorizontalAxis: {
    position: "absolute",
    backgroundColor: "black",
    width: Dimensions.get("window").width,
    height: 2,
    zIndex: 1,
  },
  markerVerticalAxis: {
    position: "absolute",
    backgroundColor: "black",
    width: 2,
    height: Dimensions.get("window").height,
  },
});
