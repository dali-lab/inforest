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
  syncReducer,
  treePhotoReducer,
} from "./slices";
import { createTransform, persistReducer, persistStore } from "redux-persist";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";
import ExpoFileSystemStorage from "redux-persist-expo-filesystem";
import { enableMapSet } from "immer";
import { UserState } from "./slices/userSlice";
import { ForestState } from "./slices/forestSlice";
import { PlotState } from "./slices/plotSlice";
import { TreeState, rehydrateTrees, upsertTrees } from "./slices/treeSlice";
import { TreeLabelState } from "./slices/treeLabelSlice";
import { TreeSpeciesState } from "./slices/treeSpeciesSlice";
import { TeamState } from "./slices/teamSlice";
import { TreePhotoPurposeState } from "./slices/treePhotoPurposeSlice";
import { ForestCensusState } from "./slices/forestCensusSlice";
import { PlotCensusState } from "./slices/plotCensusSlice";
import {
  TreeCensusState,
  rehydrateTreeCensuses,
  upsertTreeCensuses,
} from "./slices/treeCensusSlice";
import useAppDispatch from "../hooks/useAppDispatch";
import {
  rehydrateTreePhotos,
  TreePhotoState,
  upsertTreePhotos,
} from "./slices/treePhotoSlice";
import { isArray } from "lodash";

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
  sync: any;
};

// Combine reducers from slices here, so that it can be passed to Redux Persist
const rootReducer = combineReducers<RootState>({
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
  sync: syncReducer,
});

const DraftSetTransform = createTransform(
  (inboundState: RootState[keyof RootState], key) => {
    if (inboundState?.drafts) {
      return { ...inboundState, drafts: Array.from(inboundState.drafts) };
    }
    return inboundState;
  },
  (outboundState: RootState[keyof RootState], key) => {
    if (outboundState?.drafts) {
      return { ...outboundState, drafts: new Set(outboundState.drafts) };
    }
    return outboundState;
  },
  { whitelist: ["trees", "treeCensuses", "treePhotos"] }
);

// This function will need to be edited if the structure of our indices changes
const IndicesTransform = createTransform(
  (inboundState: any, key) => {
    const indices: RootState[keyof RootState]["indices"] = {};
    if (inboundState?.indices) {
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
    }
    return { ...inboundState, indices };
  },
  (outboundState: RootState[keyof RootState], key) => {
    const indices: RootState[keyof RootState]["indices"] = {};
    if (outboundState?.indices) {
      for (const index of Object.keys(outboundState.indices)) {
        indices[index] = {};
        for (const [key, value] of Object.entries(
          outboundState.indices[index]
        ) as [string, string | Set<string>][]) {
          if (isArray(value)) {
            indices[index][key] = new Set(value);
          } else indices[index][key] = value;
        }
      }
    }

    return { ...outboundState, indices };
  }
);

const persistConfig = {
  key: "root",
  storage: ExpoFileSystemStorage,
  stateReconciler: hardSet,
  transforms: [DraftSetTransform, IndicesTransform],
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
