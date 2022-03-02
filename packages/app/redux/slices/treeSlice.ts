import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Tree } from "@ong-forestry/schema";
import ROOT_URL from "../../constants/Url";
import axios from "axios";

const BASE_URL = ROOT_URL + "trees";

type GetForestTreesParams = {
  forestId: string;
  limit: number;
};

export const getForestTrees = createAsyncThunk(
  "tree/getForestTrees",
  async (params: GetForestTreesParams, thunkApi) => {
    return await axios
      .get<Tree[]>(
        `${BASE_URL}?forestId=${params.forestId}&limit=${params.limit}`
      )
      .then((response) => {
        return response.data;
      });
  }
);

export interface TreeState {
  currentForestTrees: Tree[];
  newlyDraftedTrees: Tree[];
  selectedTree?: Tree;
}

const initialState: TreeState = {
  currentForestTrees: [],
  newlyDraftedTrees: [],
  selectedTree: undefined,
};

export const treeSlice = createSlice({
  name: "tree",
  initialState,
  reducers: {
    draftNewTree: (state, action) => {
      const newTree = action.payload;
      state.newlyDraftedTrees.push(newTree);
    },
    deleteDraftedTree: (state, action) => {
      const treeTag = action.payload;
      const index = state.newlyDraftedTrees.findIndex(
        (tree) => tree.tag === treeTag
      );
      state.newlyDraftedTrees.splice(index, 1);
    },
    selectTree: (state, action) => {
      state.selectedTree = action.payload;
    },
    deselectTree: (state, _) => {
      state.selectedTree = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getForestTrees.fulfilled, (state, action) => {
      state.currentForestTrees = action.payload;
    });
  },
});

export const { draftNewTree, deleteDraftedTree, selectTree, deselectTree } =
  treeSlice.actions;

export default treeSlice.reducer;
