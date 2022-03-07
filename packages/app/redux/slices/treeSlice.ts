import { createSlice } from "@reduxjs/toolkit";
import { Tree } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";

const BASE_URL = SERVER_URL + "trees";

export interface TreeState {
  currentPlotTrees: Tree[];
}

const initialState: TreeState = {
  currentPlotTrees: [],
};

export const treeSlice = createSlice({
  name: "tree",
  initialState,
  reducers: {},
  extraReducers: {},
});

export default treeSlice.reducer;
