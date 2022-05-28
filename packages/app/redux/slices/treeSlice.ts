import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Tree } from "@ong-forestry/schema";
import axios from "axios";
import uuid from "react-native-uuid";
import SERVER_URL from "../../constants/Url";
import { isArray } from "lodash";

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
        `${BASE_URL}?forestId=${params.forestId}&limit=${params?.limit}`
      )
      .then((response) => {
        console.log("response");
        // const species = Array.from(new Set(response.data.map((tree)=>tree?.speciesCode||"")))
        // thunkApi.dispatch(getManyTreeSpecies({codes: species}))
        return response.data;
      })
      .catch((err) => {
        console.error(err);
        return [];
      });
  }
);

export const uploadTree = createAsyncThunk(
  "tree/uploadTree",
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

// takes the state and the action payload(!!) and returns the updated state with the payload's trees added. used for downloading, drafting, and rehydrating
const addTrees = (state: TreeState, action: any) => {
  let newTrees: Tree[];
  if (action?.draft || action?.rehydrate) {
    newTrees = action.data;
  } else newTrees = action;
  if (!isArray(newTrees)) newTrees = [newTrees];
  newTrees.forEach((newTree) => {
    newTree.id = uuid.v4().toString();
    if (!action?.rehydrate) state.all[newTree.id] = newTree;
    // add to drafts
    if (action?.draft) state.drafts.add(newTree.id);
    // update plots index
    if (
      !(newTree.plotId in state.indices.byPlots) ||
      !state.indices.byPlots[newTree.plotId]?.add
    ) {
      state.indices.byPlots[newTree.plotId] = new Set();
    }
    state.indices.byPlots[newTree.plotId].add(newTree.id);
    if (
      (newTree.speciesCode &&
        !(newTree.speciesCode in state.indices.bySpecies)) ||
      !state.indices.bySpecies[newTree.speciesCode]?.add
    ) {
      state.indices.bySpecies[newTree.speciesCode] = new Set();
    }
    if (newTree.speciesCode)
      state.indices.bySpecies[newTree.speciesCode].add(newTree.id);
    // update latitude index
    if (newTree.latitude) {
      state.indices.byLatitude.push({
        value: newTree.latitude,
        id: newTree.id,
      });
    }
    // update longitude index
    if (newTree.longitude) {
      state.indices.byLongitude.push({
        value: newTree.longitude,
        id: newTree.id,
      });
    }
    if (action?.draft) state.selected = newTree.id;
  });
  state.indices.byLatitude.sort(treeNumericalIndexComparator);
  state.indices.byLongitude.sort(treeNumericalIndexComparator);
  return state;
};

export const treeSlice = createSlice({
  name: "tree",
  initialState,
  reducers: {
    createTree: (state, action) => {
      return addTrees(state, action.payload);
    },
    locallyDraftNewTree: (state, action) => {
      treeSlice.caseReducers.createTree(state, {
        payload: { data: action.payload, draft: true },
        type: "tree/createTree",
      });
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
      const { updated } = action.payload;
      state.all[updated.id] = updated;
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
    rehydrateTrees: (state) => {
      state.indices = initialState.indices;
      return addTrees(state, {
        data: Object.values(state.all),
        rehydrate: true,
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getForestTrees.fulfilled, (state, action) => {
      return addTrees(state, action.payload);
    });
  },
});

export const {
  locallyDraftNewTree,
  locallyDeleteTree,
  locallyUpdateTree,
  selectTree,
  deselectTree,
  rehydrateTrees,
} = treeSlice.actions;

export default treeSlice.reducer;
