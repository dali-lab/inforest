import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Tree } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";
import { getManyTreeSpecies } from "./treeSpeciesSlice";

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
        // const species = Array.from(new Set(response.data.map((tree)=>tree?.speciesCode||"")))
        // thunkApi.dispatch(getManyTreeSpecies({codes: species}))
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
    bySpecies: Record<string, Set<string>>
  };
  newlyDraftedTrees: Tree[];
  drafts: Set<string>;
  selected?: string;
}

const initialState: TreeState = {
  all: {},
  indices: {
    byPlots: {},
    byLatitude: [],
    byLongitude: [],
    bySpecies: {},
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
      if (!(newTree.plotNumber in state.indices.byPlots)) {
        state.indices.byPlots[newTree.plotNumber] = new Set();
      }
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
      state.indices.byPlots[treeTag.plotNumber]?.delete(treeTag);
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
    updateTree: (state, action) => {
      const { tag, updates } = action.payload;
      state.all[updates.tag] = updates;
      // tag changed
      if (!!updates.tag && tag !== updates.tag) {
        const oldTree = state.all[tag];
        delete state.all[tag];
        if (state.selected === tag) {
          state.selected = updates.tag;
        }
        state.indices.byPlots[oldTree.plotNumber]?.delete(tag);
        state.indices.byPlots[oldTree.plotNumber]?.add(updates.tag);
      }
      // todo: update indices
      return state;
    },
    selectTree: (state, action) => {
      state.selected = action.payload;
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
        if (tree.speciesCode && !(tree.speciesCode in state.indices.bySpecies)) {
          state.indices.bySpecies[tree.speciesCode] = new Set()
        }
        if (tree.speciesCode) state.indices.bySpecies[tree.speciesCode].add(tree.tag)
      });
      // sort indices
      state.indices.byLatitude.sort(treeNumericalIndexComparator);
      state.indices.byLongitude.sort(treeNumericalIndexComparator);
      return state;
    });
  },
});

export const {
  draftNewTree,
  deleteDraftedTree,
  updateTree,
  selectTree,
  deselectTree,
} = treeSlice.actions;

export default treeSlice.reducer;
