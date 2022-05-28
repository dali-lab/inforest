import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import useCachedResources from "./hooks/useCachedResources";
import { store, persistor } from "./redux";
import MapScreen from "./screens/MapScreen";

export default function App() {
  const isLoadingComplete = useCachedResources();
  // useEffect(() => {
  //   persistor.purge();
  // }, []);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
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
