import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./slices";
import { persistReducer } from "redux-persist";
import ExpoFileSystemStorage from "redux-persist-expo-filesystem";

const rootReducer = combineReducers({
  user: userReducer,
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
