import { useCallback, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
<<<<<<< HEAD
import { PersistGate } from "redux-persist/integration/react";
import { NetworkProvider } from "react-native-offline";
=======
import * as ScreenOrientation from "expo-screen-orientation";
>>>>>>> origin/offline-sync-route

import useCachedResources from "./hooks/useCachedResources";
import { store, persistor } from "./redux";
import MapScreen from "./screens/MapScreen";
import { useEffect } from "react";

export default function App() {
  const isLoadingComplete = useCachedResources();
<<<<<<< HEAD
=======

  // const persistedStore = persistStore(store);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

>>>>>>> origin/offline-sync-route
  return (
    <Provider store={store}>
      <NetworkProvider>
        <PersistGate loading={null} persistor={persistor}>
          {isLoadingComplete && (
            <SafeAreaProvider>
              <MapScreen />
              <StatusBar />
            </SafeAreaProvider>
          )}
        </PersistGate>
      </NetworkProvider>
    </Provider>
  );
}
