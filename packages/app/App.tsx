import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import * as ScreenOrientation from "expo-screen-orientation";
import { PersistGate } from "redux-persist/integration/react";
import axios from "axios";
import { NetworkProvider } from "react-native-offline";
import { store, persistor } from "./redux";
import Screens from "./Screens";

// persistor.purge();

// This component should only contain the Screens component wrapped in all providers used by app
const App = () => {
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  return (
    <Provider store={store}>
      <NetworkProvider>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaProvider>
            <Screens />
          </SafeAreaProvider>
        </PersistGate>
      </NetworkProvider>
    </Provider>
  );
};
export default App;
