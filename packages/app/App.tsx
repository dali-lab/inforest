import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";

import useCachedResources from "./hooks/useCachedResources";
import { NavigationContainer } from "@react-navigation/native";
import store from "./redux";
import MapScreen from "./screens/MapScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "./screens/HomeScreen";

const Stack = createNativeStackNavigator();

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
              <Stack.Screen name="map" component={MapScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar />
        </SafeAreaProvider>
      )}
      {/* </PersistGate> */}
    </Provider>
  );
}
