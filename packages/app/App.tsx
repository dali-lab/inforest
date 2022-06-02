import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import * as ScreenOrientation from "expo-screen-orientation";

import useCachedResources from "./hooks/useCachedResources";
import store from "./redux";
import MapScreen from "./screens/MapScreen";
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
    </Provider>
  );
}
