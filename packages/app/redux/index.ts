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
  (inboundState: TreeState | TreeCensusState | TreePhotoState, key) => {
    return { ...inboundState, drafts: [...inboundState.drafts] };
  },
  (outboundState, key) => {
    return { ...outboundState, drafts: new Set(outboundState.drafts) };
  },
  { whitelist: ["trees", "treeCensuses", "treePhotos"] }
);

const IndicesTransform = createTransform(
  (inboundState: any, key) => {
    let indices;
    let state = Object.assign({}, inboundState);
    if (key == "trees")
      indices = upsertTrees(
        state as TreeState,
        Object.values(state.all)
      ).indices;
    else if (key == "treeCensuses")
      indices = upsertTreeCensuses(
        state as TreeCensusState,
        Object.values(state.all)
      ).indices;
    else if (key == "treePhotos")
      indices = upsertTreePhotos(
        state as TreePhotoState,
        Object.values(state.all)
      ).indices;
    return { ...inboundState, indices };
  },
  (outboundState: any, key) => {
    return outboundState;
  },
  { whitelist: ["trees", "treeCensuses", "treePhotos"] }
);

const persistConfig = {
  key: "root",
  storage: ExpoFileSystemStorage,
  stateReconciler: hardSet,
  transforms: [DraftSetTransform],
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

const rehydrationCallback = () => {
  // store.dispatch(rehydrateTrees());
  // store.dispatch(rehydrateTreeCensuses());
  // store.dispatch(rehydrateTreePhotos());
};

export const persistor = persistStore(store, {}, rehydrationCallback);

export type AppDispatch = typeof store.dispatch;
