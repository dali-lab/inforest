import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Region } from "react-native-maps";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";

import useCachedResources from "./hooks/useCachedResources";
import store from "./redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import MapScreen from "./screens/MapScreen";

export default function App() {
  const isLoadingComplete = useCachedResources();

  const persistedStore = persistStore(store);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistedStore}>
        {isLoadingComplete && (
          <SafeAreaProvider>
            <MapScreen />
            <StatusBar />
          </SafeAreaProvider>
        )}
      </PersistGate>
    </Provider>
  );
}
