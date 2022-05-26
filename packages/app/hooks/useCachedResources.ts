import { FontAwesome } from "@expo/vector-icons";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { FOREST_ID } from "../constants/dev";
import { getForest, getForests } from "../redux/slices/forestSlice";
import { getForestPlots } from "../redux/slices/plotSlice";
import { getForestTrees } from "../redux/slices/treeSlice";
import { getAllTreeSpecies } from "../redux/slices/treeSpeciesSlice";
import useAppDispatch from "./useAppDispatch";

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();

        // Load fonts
        await Font.loadAsync({
          ...FontAwesome.font,
          "Nunito Black": require("../assets/fonts/Nunito-Black.ttf"),
          "Nunito ExtraBold": require("../assets/fonts/Nunito-ExtraBold.ttf"),
          "Nunito Bold": require("../assets/fonts/Nunito-Bold.ttf"),
          "Nunito SemiBold": require("../assets/fonts/Nunito-SemiBold.ttf"),
          "Nunito Medium": require("../assets/fonts/Nunito-Medium.ttf"),
          "Nunito Regular": require("../assets/fonts/Nunito-Regular.ttf"),
          "Nunito Light": require("../assets/fonts/Nunito-Light.ttf"),
          "Nunito ExtraLight": require("../assets/fonts/Nunito-ExtraLight.ttf"),
          "Open Sans ExtraBold": require("../assets/fonts/OpenSans-ExtraBold.ttf"),
          "Open Sans Bold": require("../assets/fonts/OpenSans-Bold.ttf"),
          "Open Sans SemiBold": require("../assets/fonts/OpenSans-SemiBold.ttf"),
          "Open Sans Medium": require("../assets/fonts/OpenSans-Medium.ttf"),
          "Open Sans Regular": require("../assets/fonts/OpenSans-Regular.ttf"),
          "Open Sans Light": require("../assets/fonts/OpenSans-Light.ttf"),
          "space-mono": require("../assets/fonts/SpaceMono-Regular.ttf"),
        });
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isLoadingComplete;
}
