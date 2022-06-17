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
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Text, TextVariants } from "./components/Themed";

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
  useEffect(() => {
    persistor.purge();
  }, []);
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
    </Provider>
  );
}
