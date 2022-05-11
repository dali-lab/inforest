import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Tree } from "@ong-forestry/schema";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import SERVER_URL from "../../constants/Url";

const BASE_URL = SERVER_URL + "trees";

type GetForestTreesParams = {
  forestId: string;
  limit?: number;
};

export const getForestTrees = createAsyncThunk(
  "tree/getForestTrees",
  async (params: GetForestTreesParams) => {
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

export const createTree = createAsyncThunk(
  "tree/createTree",
  async (newTree: Omit<Tree, "id" | "plot">, thunkApi) => {
    thunkApi.dispatch(locallyDraftNewTree(newTree));
    // todo handle failure
    return await axios.post(`${BASE_URL}`, newTree);
  }
);

export const updateTree = createAsyncThunk(
  "tree/updateTree",
  async (treeUpdates: Tree, thunkApi) => {
    thunkApi.dispatch(locallyUpdateTree(treeUpdates));
    return await axios.patch(`${BASE_URL}?ids=${treeUpdates.id}`, treeUpdates);
  }
);

type TreeNumericalIndexItem = {
  value: number;
  id: string;
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
    bySpecies: Record<string, Set<string>>;
  };
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
  selected: undefined,
};

export const treeSlice = createSlice({
  name: "tree",
  initialState,
  reducers: {
    locallyDraftNewTree: (state, action) => {
      const newTree = action.payload;
      newTree.id = uuidv4();
      state.all[newTree.id] = newTree;
      // add to drafts
      state.drafts.add(newTree.id);
      // update plots index
      if (!(newTree.plotId in state.indices.byPlots)) {
        state.indices.byPlots[newTree.plotId] = new Set();
      }
      state.indices.byPlots[newTree.plotId].add(newTree.id);
      // update latitude index
      if (newTree.latitude) {
        state.indices.byLatitude.push({
          value: newTree.latitude,
          id: newTree.id,
        });
        state.indices.byLatitude.sort(treeNumericalIndexComparator);
      }
      // update longitude index
      if (newTree.longitude) {
        state.indices.byLongitude.push({
          value: newTree.longitude,
          id: newTree.id,
        });
        state.indices.byLongitude.sort(treeNumericalIndexComparator);
      }
      return state;
    },
    locallyDeleteTree: (state, action) => {
      const treeId = action.payload;
      const plotId = state.all[treeId].plotId;
      delete state.all[treeId];
      // remove from drafts
      state.drafts.delete(treeId);
      // remove from plots index
      state.indices.byPlots[plotId]?.delete(treeId);
      // remove from latitude index
      state.indices.byLatitude.splice(state.indices.byLatitude.indexOf(treeId));
      // remove from longitude index
      state.indices.byLongitude.splice(
        state.indices.byLongitude.indexOf(treeId)
      );
      return state;
    },
    locallyUpdateTree: (state, action) => {
      const { treeId, updates } = action.payload;
      const oldTree = state.all[treeId];
      state.all[updates.tag] = { ...oldTree, ...updates };
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
        state.all[tree.id] = tree;
        // initialize plot index key if needed
        if (!(tree.plotId in state.indices.byPlots)) {
          state.indices.byPlots[tree.plotId] = new Set();
        }
        // add to plots index
        state.indices.byPlots[tree.plotId].add(tree.id);
        // add to latitude index
        if (tree.latitude) {
          state.indices.byLatitude.push({
            value: tree.latitude,
            id: tree.id,
          });
        }
        // add to longitude index
        if (tree.longitude) {
          state.indices.byLongitude.push({
            value: tree.longitude,
            id: tree.id,
          });
        }
        if (
          tree.speciesCode &&
          !(tree.speciesCode in state.indices.bySpecies)
        ) {
          state.indices.bySpecies[tree.speciesCode] = new Set();
        }
        if (tree.speciesCode)
          state.indices.bySpecies[tree.speciesCode].add(tree.tag);
      });
      // sort indices
      state.indices.byLatitude.sort(treeNumericalIndexComparator);
      state.indices.byLongitude.sort(treeNumericalIndexComparator);
      return state;
    });
  },
});

export const {
  locallyDraftNewTree,
  locallyDeleteTree,
  locallyUpdateTree,
  selectTree,
  deselectTree,
} = treeSlice.actions;

export default treeSlice.reducer;
