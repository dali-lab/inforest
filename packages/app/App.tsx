import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { NetworkProvider } from "react-native-offline";
import useCachedResources from "./hooks/useCachedResources";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "./screens/HomeScreen";
import { MapScreenModes, MapScreenZoomLevels } from "./constants";
import { Plot } from "@ong-forestry/schema";
import { store, persistor } from "./redux";
import MapScreen from "./screens/MapScreen";
<<<<<<< HEAD

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
  // useEffect(() => {
  //   persistor.purge();
  // }, []);
  return (
    <Provider store={store}>
      <NetworkProvider>
        <PersistGate loading={null} persistor={persistor}>
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
        </PersistGate>
      </NetworkProvider>
=======
import AuthScreen from "./screens/AuthScreen";
import { useEffect } from "react";

export default function App() {
  const isLoadingComplete = useCachedResources();

  // const persistedStore = persistStore(store);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  const isLoggedIn = store.user.token != "";

  return (
    <Provider store={store}>
      {/* <PersistGate loading={null} persistor={persistedStore}> */}
      {isLoadingComplete && !isLoggedIn && (
        <SafeAreaProvider>
          <AuthScreen />
        </SafeAreaProvider>
      )}
      {isLoadingComplete && isLoggedIn && (
        <SafeAreaProvider>
          <MapScreen />
          <StatusBar />
        </SafeAreaProvider>
      )}
      {/* </PersistGate> */}
>>>>>>> auth-frontend
    </Provider>
  );
}
