import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Tree } from "@ong-forestry/schema";
import axios from "axios";
import uuid from "react-native-uuid";
import SERVER_URL from "../../constants/Url";
import { RootState, UpsertAction } from "..";

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

export const createTree = createAsyncThunk(
  "tree/createTree",
  async (newTree: Partial<Tree>) => {
    // thunkApi.dispatch(locallyDraftNewTree(newTree));
    // todo handle failure
    return await axios
      .post(`${BASE_URL}`, newTree)
      .then((response) => response.data)
      .catch((err) => {
        alert("Error when creating tree: " + err?.message);
        throw err;
      });
  }
);

export const updateTree = createAsyncThunk(
  "tree/updateTree",
  async (updatedTree: Tree, { getState, dispatch }) => {
    const oldTree = (getState() as RootState)?.trees.all[updatedTree.id];
    dispatch(locallyUpdateTree(updatedTree));
    const { id, ...updates } = updatedTree;
    return await axios
      .patch(`${BASE_URL}/${id}`, updates)
      .then((response) => {
        dispatch(clearTreeDrafts());
        return response.data;
      })
      .catch((err) => {
        dispatch(locallyUpdateTree(oldTree));
        dispatch(clearTreeDrafts());
        alert("Error while updating tree: " + err?.message);
        throw err;
      });
  }
);

export const deleteTree = createAsyncThunk(
  "tree/deleteTree",
  async (id: string) => {
    return await axios
      .delete(`${BASE_URL}/${id}`)
      .then((response) => response.data);
  }
);

// type TreeNumericalIndexItem = {
//   value: number;
//   id: string;
// };

// type TreeNumericalIndex = Set<TreeNumericalIndexItem>;

// const treeNumericalIndexComparator = (
//   a: TreeNumericalIndexItem,
//   b: TreeNumericalIndexItem
// ) => a.value - b.value;

export interface TreeState {
  all: Record<string, Tree>;
  indices: {
    byPlots: Record<string, Set<string>>;
    // byLatitude: TreeNumericalIndex;
    // byLongitude: TreeNumericalIndex;
    bySpecies: Record<string, Set<string>>;
  };
  drafts: Set<string>;
  localDeletions: Set<string>;
  selected: string | undefined;
}

const initialState: TreeState = {
  all: {},
  indices: {
    byPlots: {},
    // byLatitude: [],
    // byLongitude: [],
    bySpecies: {},
  },
  drafts: new Set([]),
  localDeletions: new Set([]),
  selected: undefined,
};

// takes the state and the action payload(!!) and returns the updated state with the payload's trees added. used for downloading, drafting, and rehydrating
export const upsertTrees = (state: TreeState, action: UpsertAction<Tree>) => {
  const newTrees: Tree[] = action.data;
  newTrees.forEach((newTree) => {
    if (!newTree?.id) newTree.id = uuid.v4().toString();
    state.all[newTree.id] = newTree;
    // add to drafts
    if (action?.draft) state.drafts.add(newTree.id);
    // update plots index
    if (!(newTree.plotId in state.indices.byPlots))
      state.indices.byPlots[newTree.plotId] = new Set([]);
    state.indices.byPlots[newTree.plotId].add(newTree.id);
    if (newTree.speciesCode) {
      if (!(newTree.speciesCode in state.indices.bySpecies))
        state.indices.bySpecies[newTree.speciesCode] = new Set([]);
      state.indices.bySpecies[newTree.speciesCode].add(newTree.id);
    }
    if (action?.selectFinal) state.selected = newTree.id;
  });

  return state;
};

export const deleteTrees = (state: TreeState, ids: string[]) => {
  for (const id of ids) {
    const currTree = state.all[id];
    state.indices.byPlots[currTree.plotId].delete(id);
    state.indices.bySpecies[currTree.speciesCode].delete(id);
    state.drafts.delete(currTree.id);
    if (state.selected === id) state.selected = undefined;
    delete state.all[id];
  }
  return state;
};

export const treeSlice = createSlice({
  name: "tree",
  initialState,
  reducers: {
    locallyDraftNewTree: (state, action) => {
      return upsertTrees(state, {
        data: [action.payload],
        draft: true,
        selectFinal: true,
      });
    },
    locallyDeleteTree: (state, action: { payload: string }) => {
      state.localDeletions.add(action.payload);
      return deleteTrees(state, [action.payload]);
    },
    locallyUpdateTree: (state, action) => {
      const updated = action.payload;
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
    clearTreeDrafts: (state) => {
      return {
        ...state,
        drafts: initialState.drafts,
        localDeletions: initialState.localDeletions,
      };
    },
    resetTrees: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getForestTrees.fulfilled, (state, action) => {
      return upsertTrees(state, { data: action.payload });
    });
    builder.addCase(
      createTree.fulfilled,
      (state, action: { payload: Tree }) => {
        return upsertTrees(state, {
          data: [action.payload],
          selectFinal: true,
        });
      }
    );
    builder.addCase(
      updateTree.fulfilled,
      (state, action: { payload: Tree }) => {
        return upsertTrees(state, { data: [action.payload] });
      }
    );
    builder.addCase(deleteTree.fulfilled, (state, action) => {
      return deleteTrees(state, [action.meta.arg]);
    });
  },
});

export const {
  locallyDraftNewTree,
  locallyDeleteTree,
  locallyUpdateTree,
  selectTree,
  deselectTree,
  clearTreeDrafts,
  resetTrees,
} = treeSlice.actions;

export default treeSlice.reducer;
