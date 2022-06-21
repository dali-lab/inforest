import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import * as ScreenOrientation from "expo-screen-orientation";
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
import AuthScreen from "./screens/AuthScreen";
import LoginView from "./screens/AuthScreen/LoginView";
import SignupView from "./screens/AuthScreen/SignupView";
import VerifyView from "./screens/AuthScreen/VerifyView";
export type CensusStackParamList = {
  map: {
    mode: MapScreenModes;
    zoomLevel: MapScreenZoomLevels;
    selectedPlot?: Plot;
  };
  home: {};
};
export type AuthStackParamList = {
  login: {};
  signup: {};
  verify: {};
};

const CensusStack = createNativeStackNavigator<CensusStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

export default function App() {
  const isLoadingComplete = useCachedResources();
  useEffect(() => {
    persistor.purge();
  }, []);
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  const isLoggedIn = store.getState().user?.token;
  return (
    <Provider store={store}>
      <NetworkProvider>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaProvider>
            {isLoadingComplete &&
              (isLoggedIn ? (
                <>
                  <NavigationContainer>
                    <CensusStack.Navigator
                      initialRouteName="home"
                      screenOptions={{ headerShown: false }}
                    >
                      <CensusStack.Screen name="home" component={HomeScreen} />
                      <CensusStack.Screen
                        name="map"
                        component={MapScreen}
                        initialParams={{
                          mode: MapScreenModes.Explore,
                          zoomLevel: MapScreenZoomLevels.Forest,
                        }}
                      />
                    </CensusStack.Navigator>
                  </NavigationContainer>
                  <StatusBar />
                </>
              ) : (
                <NavigationContainer>
                  <AuthStack.Navigator
                    initialRouteName="login"
                    screenOptions={{ headerBackTitleVisible: false }}
                  >
                    <AuthStack.Screen
                      name="signup"
                      options={{ headerTitle: "Sign Up" }}
                      component={SignupView}
                    />
                    <AuthStack.Screen
                      name="login"
                      component={LoginView}
                      options={{ headerShown: false }}
                    />
                    <AuthStack.Screen
                      name="verify"
                      options={{ headerTitle: "Verify" }}
                      component={VerifyView}
                    />
                  </AuthStack.Navigator>
                </NavigationContainer>
              ))}
          </SafeAreaProvider>
        </PersistGate>
      </NetworkProvider>
    </Provider>
  );
}
