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
} from "./slices";
import { createTransform, persistReducer, persistStore } from "redux-persist";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";
import ExpoFileSystemStorage from "redux-persist-expo-filesystem";
import { enableMapSet } from "immer";
import { UserState } from "./slices/userSlice";
import { ForestState } from "./slices/forestSlice";
import { PlotState } from "./slices/plotSlice";
import { TreeState, rehydrateTrees } from "./slices/treeSlice";
import { TreeLabelState } from "./slices/treeLabelSlice";
import { TreeSpeciesState } from "./slices/treeSpeciesSlice";
import { TeamState } from "./slices/teamSlice";
import { TreePhotoPurposeState } from "./slices/treePhotoPurposeSlice";
import { ForestCensusState } from "./slices/forestCensusSlice";
import { PlotCensusState } from "./slices/plotCensusSlice";
import {
  TreeCensusState,
  rehydrateTreeCensuses,
} from "./slices/treeCensusSlice";
import useAppDispatch from "../hooks/useAppDispatch";

enableMapSet();

export type RootState = {
  user: UserState;
  forest: ForestState;
  plots: PlotState;
  trees: TreeState;
  treeLabels: TreeLabelState;
  treeSpecies: TreeSpeciesState;
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
  teams: teamReducer,
  treePhotoPurposes: treePhotoPurposeReducer,
  forestCensuses: forestCensusReducer,
  plotCensuses: plotCensusReducer,
  treeCensuses: treeCensusReducer,
  sync: syncReducer,
});

const DraftSetTransform = createTransform(
  (inboundState: TreeState | TreeCensusState, key) => {
    return { ...inboundState, drafts: [...inboundState.drafts] };
  },
  (outboundState, key) => {
    return { ...outboundState, drafts: new Set(outboundState.drafts) };
  },
  { whitelist: ["trees", "treeCensuses"] }
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

const rehydrationCallback = () => {
  rehydrateTrees();
  rehydrateTreeCensuses();
};

export const store = configureStore({
  // reducer: rootReducer,
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
});

export const persistor = persistStore(store, {}, rehydrationCallback);

export type AppDispatch = typeof store.dispatch;
