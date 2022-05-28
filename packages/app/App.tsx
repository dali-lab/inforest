import { useCallback, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { NetworkProvider } from "react-native-offline";

import useCachedResources from "./hooks/useCachedResources";
import { store, persistor } from "./redux";
import MapScreen from "./screens/MapScreen";

export default function App() {
  const isLoadingComplete = useCachedResources();
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
