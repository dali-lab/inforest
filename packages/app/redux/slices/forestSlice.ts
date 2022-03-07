import { createSlice } from "@reduxjs/toolkit";
import { Forest } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";

const BASE_URL = ROOT_URL + "forests/";

export interface ForestState {
  currentTeamForests: Forest[];
  currentForest: Forest | null;
}

const initialState: ForestState = {
  currentTeamForests: [],
  currentForest: null,
};

export const forestSlice = createSlice({
  name: "forest",
  initialState,
  reducers: {},
  extraReducers: {},
});

export default forestSlice.reducer;
