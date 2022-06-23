import { Plot } from "@ong-forestry/schema";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { FC } from "react";
import { StatusBar } from "expo-status-bar";
import { MapScreenModes, MapScreenZoomLevels } from "./constants";
import useAppSelector from "./hooks/useAppSelector";
import useCachedResources from "./hooks/useCachedResources";
import LoginScreen from "./screens/AuthScreens/LoginScreen";
import SignupScreen from "./screens/AuthScreens/SignupScreen";
import VerifyScreen from "./screens/AuthScreens/VerifyScreen";
import { HomeScreen } from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";

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

// This component contains all screens and navigation logic
// It is separate from App to allow for use of useAppSelector
const Screens: FC = () => {
  const isLoadingComplete = useCachedResources();
  const { token } = useAppSelector((state) => state.user);
  return isLoadingComplete ? (
    token ? (
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
            component={SignupScreen}
          />
          <AuthStack.Screen
            name="login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <AuthStack.Screen
            name="verify"
            options={{ headerTitle: "Verify" }}
            component={VerifyScreen}
          />
        </AuthStack.Navigator>
      </NavigationContainer>
    )
  ) : null;
};

export default Screens;
