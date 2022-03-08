import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Tree } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";

const BASE_URL = SERVER_URL + "trees";

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

type TreeNumericalIndexItem = {
  value: number;
  treeTag: string;
};

type TreeNumericalIndex = TreeNumericalIndexItem[];

const treeNumericalIndexComparator = (
  a: TreeNumericalIndexItem,
  b: TreeNumericalIndexItem
) => a.value - b.value;

export interface TreeState {
  all: Record<string, Tree>;
  indices: {
    byPlots: Record<string, Set<string>>;
    byLatitude: TreeNumericalIndex;
    byLongitude: TreeNumericalIndex;
  };
  newlyDraftedTrees: Tree[];
  drafts: Set<string>;
  selected?: Tree;
}

const initialState: TreeState = {
  all: {},
  indices: {
    byPlots: {},
    byLatitude: [],
    byLongitude: [],
  },
  drafts: new Set([]),
  newlyDraftedTrees: [],
  selected: undefined,
};

export const treeSlice = createSlice({
  name: "tree",
  initialState,
  reducers: {
    draftNewTree: (state, action) => {
      const newTree = action.payload;
      state.all[newTree.tag] = newTree;
      // add to drafts
      state.drafts.add(newTree.tag);
      // update plots index
      state.indices.byPlots[newTree.plotNumber].add(newTree.tag);
      // update latitude index
      if (!!newTree.latitude) {
        state.indices.byLatitude.push({
          value: newTree.latitude,
          treeTag: newTree.tag,
        });
        state.indices.byLatitude.sort(treeNumericalIndexComparator);
      }
      // update longitude index
      if (!!newTree.longitude) {
        state.indices.byLongitude.push({
          value: newTree.longitude,
          treeTag: newTree.tag,
        });
        state.indices.byLongitude.sort(treeNumericalIndexComparator);
      }
      return state;
    },
    deleteDraftedTree: (state, action) => {
      const treeTag = action.payload;
      delete state.all[treeTag];
      // remove from drafts
      state.drafts.delete(treeTag);
      // remove from plots index
      state.indices.byPlots[treeTag.plotNumber].delete(treeTag);
      // remove from latitude index
      state.indices.byLatitude.splice(
        state.indices.byLatitude.indexOf(treeTag)
      );
      // remove from longitude index
      state.indices.byLongitude.splice(
        state.indices.byLongitude.indexOf(treeTag)
      );
      return state;
    },
    selectTree: (state, action) => {
      state.selected = state.all[action.payload];
      return state;
    },
    deselectTree: (state) => {
      state.selected = undefined;
      return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getForestTrees.fulfilled, (state, action) => {
      action.payload.forEach((tree) => {
        state.all[tree.tag] = tree;
        // initialize plot index key if needed
        if (!(tree.plotNumber in state.indices.byPlots)) {
          state.indices.byPlots[tree.plotNumber] = new Set();
        }
        // add to plots index
        state.indices.byPlots[tree.plotNumber].add(tree.tag);
        // add to latitude index
        if (!!tree.latitude) {
          state.indices.byLatitude.push({
            value: tree.latitude,
            treeTag: tree.tag,
          });
        }
        // add to longitude index
        if (!!tree.longitude) {
          state.indices.byLongitude.push({
            value: tree.longitude,
            treeTag: tree.tag,
          });
        }
      });
      // sort indices
      state.indices.byLatitude.sort(treeNumericalIndexComparator);
      state.indices.byLongitude.sort(treeNumericalIndexComparator);
      return state;
    });
  },
});

export const { draftNewTree, deleteDraftedTree, selectTree, deselectTree } =
  treeSlice.actions;

export default treeSlice.reducer;
