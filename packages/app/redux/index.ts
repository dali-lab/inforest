import { AnyAction, combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  userReducer,
  forestReducer,
  plotReducer,
  treeReducer,
  teamReducer,
  treeLabelReducer,
  treeSpeciesReducer,
  treePhotoPurposeReducer,
  forestCensusReducer,
  plotCensusReducer,
  treeCensusReducer,
  treeCensusLabelReducer,
  syncReducer,
  treePhotoReducer,
  UserState,
  ForestState,
  PlotState,
  TreeState,
  TreeLabelState,
  TreeSpeciesState,
  TreePhotoState,
  TeamState,
  ForestCensusState,
  PlotCensusState,
  TreeCensusState,
  TreePhotoPurposeState,
  TreeCensusLabelState,
} from "./slices";
import { createTransform, persistReducer, persistStore } from "redux-persist";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";
import ExpoFileSystemStorage from "redux-persist-expo-filesystem";
import { enableMapSet } from "immer";
import { isArray, isObject } from "lodash";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SyncState } from "./slices/syncSlice";

enableMapSet();

export type RootState = {
  user: UserState;
  forest: ForestState;
  plots: PlotState;
  trees: TreeState;
  treeLabels: TreeLabelState;
  treeSpecies: TreeSpeciesState;
  treePhotos: TreePhotoState;
  teams: TeamState;
  treePhotoPurposes: TreePhotoPurposeState;
  forestCensuses: ForestCensusState;
  plotCensuses: PlotCensusState;
  treeCensuses: TreeCensusState;
  treeCensusLabels: TreeCensusLabelState;
  sync: SyncState;
};

const reducers = {
  user: userReducer,
  forest: forestReducer,
  plots: plotReducer,
  trees: treeReducer,
  treeLabels: treeLabelReducer,
  treeSpecies: treeSpeciesReducer,
  treePhotos: treePhotoReducer,
  teams: teamReducer,
  treePhotoPurposes: treePhotoPurposeReducer,
  forestCensuses: forestCensusReducer,
  plotCensuses: plotCensusReducer,
  treeCensuses: treeCensusReducer,
  treeCensusLabels: treeCensusLabelReducer,
  sync: syncReducer,
};

// Combine reducers from slices here, so that it can be passed to Redux Persist
const rootReducer = combineReducers<RootState>(reducers);

const SurfaceSetTransform = createTransform(
  (inboundState: any) => {
    if ("drafts" in inboundState) {
      return { ...inboundState, drafts: Array.from(inboundState.drafts) };
    }
    return inboundState;
  },
  (outboundState: RootState[keyof RootState]) => {
    if ("drafts" in outboundState) {
      return { ...outboundState, drafts: new Set(outboundState.drafts) };
    }
    return outboundState;
  },
  { whitelist: ["trees", "treeCensuses", "treePhotos", "treeCensusLabels"] }
);

// This transform translates indices' sets to arrays when storing, and vice versa when rehydrating
// This function will need to be edited if the structure of our indices changes
// since it assumes all indices are of type Record<string, Set<string>>
const IndicesTransform = createTransform(
  (inboundState: any, key) => {
    const indices: any = {};
    if ("indices" in inboundState) {
      for (const index of Object.keys(inboundState.indices)) {
        indices[index] = {};
        for (const [key, value] of Object.entries(
          inboundState.indices[index]
        ) as [string, string[]][]) {
          if (value.hasOwnProperty("add")) {
            indices[index][key] = Array.from(value);
          } else indices[index][key] = value;
        }
      }
      return { ...inboundState, indices };
    }
    console.log("inbound", key, inboundState);
    return inboundState;
  },
  (outboundState: any, key) => {
    const indices: any = {};
    if ("indices" in outboundState) {
      for (const index of Object.keys(outboundState.indices)) {
        indices[index] = {};
        for (const [key, value] of Object.entries(
          outboundState.indices[index]
        ) as [string, string | Set<string>][]) {
          if (isArray(value) || isObject(value)) {
            indices[index][key] = new Set(value);
          } else indices[index][key] = value;
        }
      }
      return { ...outboundState, indices };
    }
    console.log("outbound", key, outboundState);

    return outboundState;
  }
);

// This transformer deselects any selected trees, plots, etc so they aren't selected upon re-opening app
const SelectedTransformer = createTransform(
  (inboundState: RootState[keyof RootState]) => {
    if ("selected" in inboundState)
      return { ...inboundState, selected: undefined };
    return inboundState;
  }
);

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  stateReconciler: hardSet,
  transforms: [SurfaceSetTransform, IndicesTransform, SelectedTransformer],
  blacklist: ["sync"],
};

const persistedReducer = persistReducer<RootState, AnyAction>(
  persistConfig,
  rootReducer
);

export const store = configureStore({
  // reducer: rootReducer,
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
});

export const persistor = persistStore(store, {});

export type AppDispatch = typeof store.dispatch;

export type UpsertAction<Model> = {
  data: Model[];
  draft?: boolean;
  selectFinal?: boolean;
};
