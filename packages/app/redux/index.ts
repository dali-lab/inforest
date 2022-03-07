import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  userReducer,
  forestReducer,
  plotReducer,
  treeReducer,
  teamReducer,
  tripReducer,
} from "./slices";
import { persistReducer } from "redux-persist";
import ExpoFileSystemStorage from "redux-persist-expo-filesystem";
import { enableMapSet } from "immer";

enableMapSet();

// Combine reducers from slices here, so that it can be passed to Redux Persist
const rootReducer = combineReducers({
  user: userReducer,
  forest: forestReducer,
  plots: plotReducer,
  trees: treeReducer,
  teams: teamReducer,
  trips: tripReducer,
});

const persistConfig = {
  key: "root",
  storage: ExpoFileSystemStorage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
