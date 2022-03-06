import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Tree } from "@ong-forestry/schema";
import ROOT_URL from "../../constants/Url";
import axios from "axios";

const BASE_URL = ROOT_URL + "trees";

type GetForestTreesParams = {
  forestId: string;
  limit?: number;
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
  all: Record<string, Tree>;
  indices: {
    byPlots: Record<string, string[]>;
  };
  newlyDraftedTrees: Tree[];
  drafts: string[];
  selected?: Tree;
}

const initialState: TreeState = {
  all: {},
  indices: {
    byPlots: {},
  },
  drafts: [],
  newlyDraftedTrees: [],
  selected: undefined,
};

export const treeSlice = createSlice({
  name: "tree",
  initialState,
  reducers: {
    draftNewTree: (state, action) => {
      const newTree = action.payload;
      if (!state.newlyDraftedTrees) {
        state.newlyDraftedTrees = [];
      }
      state.newlyDraftedTrees.push(newTree);
      return state;
    },
    deleteDraftedTree: (state, action) => {
      const treeTag = action.payload;
      const index = state.newlyDraftedTrees.findIndex(
        (tree) => tree.tag === treeTag
      );
      state.newlyDraftedTrees.splice(index, 1);
      return state;
    },
    selectTree: (state, action) => {
      state.selected = action.payload;
      return state;
    },
    deselectTree: (state, _) => {
      state.selected = undefined;
      return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getForestTrees.fulfilled, (state, action) => {
      action.payload.forEach((tree) => {
        state.all[tree.tag] = tree;
        if (!state.indices.byPlots[tree.plotNumber]) {
          state.indices.byPlots[tree.plotNumber] = [];
        }
        state.indices.byPlots[tree.plotNumber].push(tree.tag);
      });
      return state;
    });
  },
});

export const { draftNewTree, deleteDraftedTree, selectTree, deselectTree } =
  treeSlice.actions;

export default treeSlice.reducer;
