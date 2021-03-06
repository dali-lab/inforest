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
} from "./slices";
import { createTransform, persistReducer, persistStore } from "redux-persist";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";
import ExpoFileSystemStorage from "redux-persist-expo-filesystem";
import { enableMapSet } from "immer";
import { isArray, isObject } from "lodash";
import { isEmpty } from "lodash";
import { RootState } from "./util";

enableMapSet();

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
  (inboundState: any, key) => {
    return {
      ...inboundState,
      ...("drafts" in inboundState
        ? { drafts: Array.from(inboundState.drafts) }
        : {}),
      ...("localDeletions" in inboundState
        ? { localDeletions: Array.from(inboundState.localDeletions) }
        : {}),
    };
  },
  (outboundState: RootState[keyof RootState]) => {
    return {
      ...outboundState,
      ...("drafts" in outboundState
        ? { drafts: new Set(outboundState.drafts) }
        : {}),
      ...("localDeletions" in outboundState
        ? { localDeletions: new Set(outboundState.localDeletions) }
        : {}),
    };
  },
  { whitelist: ["trees", "treeCensuses", "treePhotos", "treeCensusLabels"] }
);

// This transform translates indices' sets to arrays when storing, and vice versa when rehydrating
// This function will need to be edited if the structure of our indices changes
// since it assumes all indices are of type Record<string, Set<string>>
const IndicesTransform = createTransform(
  (inboundState: any) => {
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
    return inboundState;
  },
  (outboundState: any) => {
    const indices: any = {};
    if ("indices" in outboundState) {
      for (const index of Object.keys(outboundState.indices)) {
        indices[index] = {};
        for (const [key, value] of Object.entries(
          outboundState.indices[index]
        ) as [string, string | Set<string>][]) {
          if (value && (isArray(value) || isObject(value))) {
            indices[index][key] = isEmpty(value) ? new Set([]) : new Set(value);
          } else indices[index][key] = value;
        }
      }
      return { ...outboundState, indices };
    }
    return outboundState;
  }
);
// This transformer deselects any selected trees, plots, etc so they aren't selected upon re-opening app
const SelectedTransformer = createTransform(
  (inboundState: RootState[keyof RootState]) => {
    if ("selected" in inboundState)
      return { ...inboundState, selected: undefined };
    return inboundState;
  },
  (outboundState) => outboundState,
  { blacklist: ["forest, forestCensuses"] }
);

const LoadingTransformer = createTransform(
  (inboundState: any) => {
    if ("loading" in inboundState) return { ...inboundState, loading: false };
    return inboundState;
  },
  (outboundState: RootState[keyof RootState]) => {
    if ("loadingTasks" in outboundState) {
      return { ...outboundState, loadingTasks: new Set([]) };
    }
    return outboundState;
  }
);

export const persistConfig = {
  key: "root",
  storage: ExpoFileSystemStorage,
  stateReconciler: hardSet,
  transforms: [
    SurfaceSetTransform,
    IndicesTransform,
    SelectedTransformer,
    LoadingTransformer,
  ],
  debug: true,
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
