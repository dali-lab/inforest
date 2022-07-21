import { createSlice } from "@reduxjs/toolkit";
import { Tree } from "@ong-forestry/schema";
import axios from "axios";
import uuid from "react-native-uuid";
import SERVER_URL from "../../constants/Url";
import {
  RootState,
  UpsertAction,
  createAppAsyncThunk,
  throwIfLoadingBase,
} from "../util";
import { produce } from "immer";

const BASE_URL = SERVER_URL + "trees";

type GetForestTreesParams = {
  forestId: string;
  limit?: number;
};

const throwIfLoading = throwIfLoadingBase("trees");

export const getForestTrees = createAppAsyncThunk(
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

export const createTree = createAppAsyncThunk(
  "tree/createTree",
  async (newTree: Partial<Tree>, { dispatch, getState }) => {
    throwIfLoading(getState());
    dispatch(startTreeLoading());
    return await axios
      .post(`${BASE_URL}`, newTree)
      .finally(() => dispatch(stopTreeLoading()))
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        alert("Error when creating tree: " + err?.message);
        throw err;
      });
  }
);

export const updateTree = createAppAsyncThunk(
  "tree/updateTree",
  async (updatedTree: Tree, { getState, dispatch }) => {
    const oldTree = (getState() as RootState)?.trees.all[updatedTree.id];
    dispatch(locallyUpdateTree(updatedTree));
    const { id, ...updates } = updatedTree;
    return await axios
      .patch(`${BASE_URL}/${id}`, updates)
      .then((response) => {
        // dispatch(clearTreeDrafts());
        return response.data;
      })
      .catch((err) => {
        dispatch(locallyUpdateTree(oldTree));
        // dispatch(clearTreeDrafts());
        alert("Error while updating tree: " + err?.message);
        throw err;
      });
  }
);

export const deleteTree = createAppAsyncThunk(
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
    byTag: Record<string, string>;
  };
  drafts: Set<string>;
  localDeletions: Set<string>;
  selected: string | undefined;
  loading: boolean;
}

const initialState: TreeState = {
  all: {},
  indices: {
    byPlots: {},
    // byLatitude: [],
    // byLongitude: [],
    bySpecies: {},
    byTag: {},
  },
  drafts: new Set([]),
  localDeletions: new Set([]),
  selected: undefined,
  loading: false,
};

// takes the state and the action payload(!!) and returns the updated state with the payload's trees added. used for downloading, drafting, and rehydrating
export const upsertTrees = (
  state: TreeState,
  action: UpsertAction<Tree>
): TreeState => {
  const draftModels = action?.overwriteNonDrafts
    ? Object.values(state.all).filter((tree) => state.drafts.has(tree.id))
    : [];
  return produce(
    action?.overwriteNonDrafts
      ? upsertTrees(initialState, { data: draftModels, draft: true })
      : state,
    (newState) => {
      const newTrees: Tree[] = action.data;
      newTrees.forEach((newTree) => {
        const oldTree = newState?.all?.[newTree?.id || ""];
        if (!newTree?.id) newTree.id = uuid.v4().toString();
        newState.all[newTree.id] = newTree;
        // add to drafts
        if (action?.draft) newState.drafts.add(newTree.id);

        // update plots index
        // A tree's plot id should never change so this probably isnt needed
        // if (oldTree && oldTree?.plotId !== newTree?.plotId)
        //   newState.indices.byPlots[oldTree.plotId].delete(newTree.id);
        if (!(newTree.plotId in newState.indices.byPlots))
          newState.indices.byPlots[newTree.plotId] = new Set([]);
        newState.indices.byPlots[newTree.plotId].add(newTree.id);

        if (
          oldTree &&
          oldTree?.speciesCode &&
          oldTree?.speciesCode !== newTree?.speciesCode
        )
          newState.indices.bySpecies[oldTree.speciesCode].delete(newTree.id);
        if (newTree?.speciesCode) {
          if (!(newTree.speciesCode in newState.indices.bySpecies))
            newState.indices.bySpecies[newTree.speciesCode] = new Set([]);
          newState.indices.bySpecies[newTree.speciesCode].add(newTree.id);
        }
        // TODO: revisit this
        try {
          if (newTree?.tag) {
            newState.indices.byTag[newTree.tag] = newTree.id;
          }
        } catch (e) {
          // console.error(e);
        }
        if (action?.selectFinal) newState.selected = newTree.id;
      });
    }
  );
};

export const deleteTrees = (state: TreeState, ids: string[]) => {
  for (const id of ids) {
    const currTree = state.all[id];
    state.indices.byPlots[currTree.plotId].delete(id);
    if (currTree?.speciesCode)
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
        // selectFinal: true,
      });
    },
    locallyDeleteTree: (state, action: { payload: string }) => {
      state.localDeletions.add(action.payload);
      return deleteTrees(state, [action.payload]);
    },
    deleteTreeById: (state, action: { payload: string }) =>
      deleteTrees(state, [action.payload]),
    locallyUpdateTree: (state, action) => {
      return upsertTrees(state, { data: [action.payload], draft: true });
    },
    selectTree: (state, action) => {
      state.selected = action.payload;
      return state;
    },
    deselectTree: (state) => {
      state.selected = undefined;
      return state;
    },
    clearTreeDrafts: (
      state,
      action: { payload: { added?: string[]; deleted?: string[] } }
    ) => {
      for (const id of action?.payload?.added || []) {
        state.drafts.delete(id);
      }
      for (const id of action?.payload?.deleted || []) {
        state.localDeletions.delete(id);
      }
      return state;
    },
    resetTrees: () => initialState,
    startTreeLoading: (state) => ({ ...state, loading: true }),
    stopTreeLoading: (state) => ({ ...state, loading: false }),
  },
  extraReducers: (builder) => {
    builder.addCase(getForestTrees.fulfilled, (state, action) => {
      return upsertTrees(state, {
        data: action.payload,
        overwriteNonDrafts: true,
      });
    });
    builder.addCase(
      createTree.fulfilled,
      (state, action: { payload: Tree }) => {
        return upsertTrees(state, {
          data: [action.payload],
          // selectFinal: true,
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
      if (action.meta.arg === state.selected) state.selected = undefined;
      return deleteTrees(state, [action.meta.arg]);
    });
  },
});

export const {
  locallyDraftNewTree,
  locallyDeleteTree,
  deleteTreeById,
  locallyUpdateTree,
  selectTree,
  deselectTree,
  clearTreeDrafts,
  resetTrees,
  startTreeLoading,
  stopTreeLoading,
} = treeSlice.actions;

export default treeSlice.reducer;
