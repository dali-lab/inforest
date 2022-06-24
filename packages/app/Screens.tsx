import { Plot } from "@ong-forestry/schema";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { FC, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { MapScreenModes, MapScreenZoomLevels } from "./constants";
import useAppSelector from "./hooks/useAppSelector";
import useCachedResources from "./hooks/useCachedResources";
import LoginScreen from "./screens/AuthScreens/LoginScreen";
import SignupScreen from "./screens/AuthScreens/SignupScreen";
import VerifyScreen from "./screens/AuthScreens/VerifyScreen";
import { HomeScreen } from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import axios from "axios";
import ProfileScreen from "./screens/ProfileScreen";

export type CensusStackParamList = {
  map: {
    mode: MapScreenModes;
    zoomLevel: MapScreenZoomLevels;
    selectedPlot?: Plot;
  };
  home: Record<string, unknown>;
  profile: Record<string, unknown>;
};
export type AuthStackParamList = {
  login: Record<string, unknown>;
  signup: Record<string, unknown>;
  verify: Record<string, unknown>;
};

const CensusStack = createNativeStackNavigator<CensusStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

// This component contains all screens and navigation logic
// It is separate from App to allow for use of useAppSelector
const Screens: FC = () => {
  const isLoadingComplete = useCachedResources();
  const { token, currentUser } = useAppSelector((state) => state.user);
  useEffect(() => {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, [token]);
  return isLoadingComplete ? (
    token ? (
      currentUser?.verified ? (
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
              <CensusStack.Screen name="profile" component={ProfileScreen} />
            </CensusStack.Navigator>
          </NavigationContainer>
          <StatusBar />
        </>
      ) : (
        <VerifyScreen />
      )
    ) : (
      <NavigationContainer>
        <AuthStack.Navigator
          initialRouteName="login"
          screenOptions={{
            headerBackTitleVisible: false,
            headerTitle: "",
          }}
        >
          <AuthStack.Screen
            name="login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <AuthStack.Screen name="signup" component={SignupScreen} />
        </AuthStack.Navigator>
      </NavigationContainer>
    )
  ) : null;
};

export default Screens;
