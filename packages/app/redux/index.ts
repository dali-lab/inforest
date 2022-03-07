import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { userReducer, forestReducer, plotReducer, treeReducer } from "./slices";
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
});

const persistConfig = {
  key: "root",
  storage: ExpoFileSystemStorage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: rootReducer,
  // reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
