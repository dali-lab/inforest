import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";

import useCachedResources from "./hooks/useCachedResources";
import { NavigationContainer } from "@react-navigation/native";
import store from "./redux";
import MapScreen from "./screens/MapScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "./screens/HomeScreen";
import { MapScreenModes, MapScreenZoomLevels } from "./constants";
import { Plot } from "@ong-forestry/schema";

export type RootStackParamList = {
  map: {
    mode: MapScreenModes;
    zoomLevel: MapScreenZoomLevels;
    selectedPlot?: Plot;
  };
  home: any;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const isLoadingComplete = useCachedResources();

  // const persistedStore = persistStore(store);

  return (
    <Provider store={store}>
      {/* <PersistGate loading={null} persistor={persistedStore}> */}
      {isLoadingComplete && (
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="home"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="home" component={HomeScreen} />
              <Stack.Screen
                name="map"
                component={MapScreen}
                initialParams={{
                  mode: MapScreenModes.Explore,
                  zoomLevel: MapScreenZoomLevels.Forest,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar />
        </SafeAreaProvider>
      )}
      {/* </PersistGate> */}
    </Provider>
  );
}
