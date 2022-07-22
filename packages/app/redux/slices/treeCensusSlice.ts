import { createSlice } from "@reduxjs/toolkit";
import { TreeCensus, TreeCensusLabel, TreePhoto } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";
import uuid from "react-native-uuid";
import { produce } from "immer";
import {
  RootState,
  UpsertAction,
  createAppAsyncThunk,
  throwIfLoadingBase,
} from "../util";
import { addTreePhotos } from "./treePhotoSlice";
import { addTreeCensusLabels } from "./treeCensusLabelSlice";
import { deselectTree } from "./treeSlice";

const BASE_URL = SERVER_URL + "trees/censuses";

type GetPlotCensusTreeCensusesParams = {
  plotCensusId: string;
};

type GetForestTreeCensusesParams = {
  forestId: string;
};

const throwIfLoading = throwIfLoadingBase("treeCensuses");

export const populateTreeCensusModels = createAppAsyncThunk(
  "treeCensus/populateTreeCensusModels",
  async (censuses: TreeCensus[], thunkApi) => {
    const newCensuses: TreeCensus[] = [];
    let newCensusLabels: TreeCensusLabel[] = [];
    let newPhotos: TreePhoto[] = [];
    censuses.forEach((census) => {
      const { labels, photos, ...censusData } = census;
      newCensuses.push(censusData);
      newCensusLabels = newCensusLabels.concat(
        //@ts-ignore
        labels?.map((label) => label?.TreeCensusLabel) || []
      );
      newPhotos = newPhotos.concat(photos || []);
    });
    // this is O(4n) which we don't like since ideally we just loop thru it once
    // we have to do this because we don't have direct access to the treeCensusLabel and treePhoto states in this slice
    // possible slice restructuring could solve this inefficiency
    thunkApi.dispatch(addTreeCensuses(newCensuses));
    thunkApi.dispatch(addTreeCensusLabels(newCensusLabels));
    thunkApi.dispatch(addTreePhotos(newPhotos));
  }
);

export const getPlotCensusTreeCensuses = createAppAsyncThunk(
  "treeCensus/getPlotCensusTreeCensuses",
  async (params: GetPlotCensusTreeCensusesParams, { dispatch }) => {
    return await axios
      .get<TreeCensus[]>(`${BASE_URL}?plotCensusId=${params.plotCensusId}`)
      .then((response) => {
        dispatch(populateTreeCensusModels(response.data));
      });
  }
);

export const getForestTreeCensuses = createAppAsyncThunk(
  "treeCensus/getForestTreeCensuses",
  async (params: GetForestTreeCensusesParams, { dispatch }) => {
    return await axios
      .get<TreeCensus[]>(`${BASE_URL}?forestId=${params.forestId}`)
      .then((response) => {
        dispatch(populateTreeCensusModels(response.data));
      });
  }
);

export const createTreeCensus = createAppAsyncThunk(
  "treeCensus/createTreeCensus",
  async (newCensus: Partial<TreeCensus>, { getState, dispatch }) => {
    throwIfLoading(getState());
    dispatch(startTreeCensusLoading());
    return await axios
      .post(`${BASE_URL}`, newCensus)
      .finally(() => dispatch(stopTreeCensusLoading()))
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        alert("Error while uploading tree census data: " + err?.message);
        throw err;
      });
  }
);

export const updateTreeCensus = createAppAsyncThunk(
  "treeCensus/updateTreeCensus",
  async (updatedCensus: TreeCensus, { getState, dispatch }) => {
    const oldCensus = (getState() as RootState)?.trees.all[updatedCensus.id];
    dispatch(locallyUpdateTreeCensus(updatedCensus));
    const { id, ...updates } = updatedCensus;
    return await axios
      .patch(`${BASE_URL}/${id}`, updates)
      .then((response) => {
        // dispatch(clearTreeCensusDrafts());
        return response.data;
      })
      .catch((err) => {
        dispatch(locallyUpdateTreeCensus(oldCensus));
        // dispatch(clearTreeCensusDrafts());
        alert("Error while updating tree census: " + err?.message);
        throw err;
      });
  }
);

export const deleteTreeCensus = createAppAsyncThunk(
  "treeCensus/deleteTreeCensus",
  async (id: string, { dispatch }) => {
    return await axios
      .delete(`${BASE_URL}/${id}`)
      .then((response) => {
        dispatch(deselectTree());
        alert("Census successfully deleted.");
        return response.data;
      })
      .catch((err) => {
        alert("Error while deleting tree census: " + err?.message);
        throw err;
      });
  }
);

// This is a thunk to enable calling dispatching
export const locallyDeleteTreeCensus = createAppAsyncThunk(
  "treeCensus/locallyDeleteTreeCensus",
  async (id: string, { dispatch }) => {
    dispatch(deselectTree());
    return id;
  }
);

// takes the state and the action payload(!!) and returns the updated state with the payload's censuses added. used for downloading, drafting, and rehydrating
export const upsertTreeCensuses = (
  state: TreeCensusState,
  action: UpsertAction<TreeCensus>
): TreeCensusState => {
  const draftModels = action?.overwriteNonDrafts
    ? Object.values(state.all).filter((treeCensus) =>
        state.drafts.has(treeCensus.id)
      )
    : [];
  return produce(
    action?.overwriteNonDrafts
      ? upsertTreeCensuses(initialState, {
          data: draftModels,
          draft: true,
        })
      : state,
    (newState) => {
      const newCensuses: TreeCensus[] = action.data;
      newCensuses.forEach((newCensus) => {
        if (!newCensus?.id) newCensus.id = uuid.v4().toString();
        newState.all[newCensus.id] = newCensus;
        // add to drafts
        if (action?.draft) newState.drafts.add(newCensus.id);
        if (!(newCensus.plotCensusId in newState.indices.byPlotCensus))
          newState.indices.byPlotCensus[newCensus.plotCensusId] = new Set([]);
        newState.indices.byPlotCensus[newCensus.plotCensusId].add(newCensus.id);
        if (!(newCensus.treeId in newState.indices.byTree))
          newState.indices.byTree[newCensus.treeId] = new Set([]);
        newState.indices.byTree[newCensus.treeId].add(newCensus.id);
        newState.indices.byTreeActive[newCensus.treeId] = newCensus.id;
        if (action?.selectFinal) newState.selected = newCensus.id;
      });
    }
  );
};

export const deleteTreeCensuses = (state: TreeCensusState, ids: string[]) => {
  for (const id of ids) {
    const currCensus = state.all[id];
    state.indices.byPlotCensus[currCensus.plotCensusId].delete(id);
    state.indices.byTree[currCensus.treeId].delete(id);
    delete state.indices.byTreeActive[currCensus.treeId];
    if (id === state.selected) state.selected = undefined;
    delete state.all[id];
  }
  return state;
};

export interface TreeCensusState {
  all: Record<string, TreeCensus>;
  indices: {
    byPlotCensus: Record<string, Set<string>>;
    byTree: Record<string, Set<string>>;
    byTreeActive: Record<string, string>;
  };
  drafts: Set<string>;
  localDeletions: Set<string>;
  selected: string | undefined;
  loading: boolean;
  failedDrafts: string[];
  failedDeletions: string[];
}

const initialState: TreeCensusState = {
  all: {},
  indices: {
    byPlotCensus: {},
    byTree: {},
    byTreeActive: {},
  },
  drafts: new Set([]),
  localDeletions: new Set([]),
  selected: undefined,
  loading: false,
  failedDrafts: [],
  failedDeletions: [],
};

export const treeCensusSlice = createSlice({
  name: "treeCensus",
  initialState,
  reducers: {
    addTreeCensuses: (state, action: { payload: TreeCensus[] }) => {
      return upsertTreeCensuses(state, {
        data: action.payload,
        overwriteNonDrafts: true,
      });
    },
    locallyCreateTreeCensus: (state, action) => {
      return upsertTreeCensuses(state, {
        data: [action.payload],
        draft: true,
        selectFinal: true,
      });
    },
    locallyUpdateTreeCensus: (state, action) => {
      console.log("updating", action.payload);
      return upsertTreeCensuses(state, { data: [action.payload], draft: true });
    },
    selectTreeCensus: (state, action) => {
      state.selected = action.payload;
      return state;
    },
    deselectTreeCensus: (state) => {
      state.selected = undefined;
      return state;
    },
    clearTreeCensusDrafts: (
      state,
      action: { payload: { added?: string[]; deleted?: string[] } }
    ) => {
      for (const id of action?.payload?.added || []) {
        state.drafts.delete(id);
      }
      for (const id of action?.payload?.deleted || []) {
        state.localDeletions.delete(id);
      }
      state.failedDrafts = Array.from(state.drafts);
      state.failedDeletions = Array.from(state.failedDeletions);
      return state;
    },
    clearTreeCensusFailed: (state) => ({
      ...state,
      failedDrafts: initialState.failedDrafts,
      failedDeletions: initialState.failedDeletions,
    }),
    resetTreeCensuses: () => initialState,
    startTreeCensusLoading: (state) => ({ ...state, loading: true }),
    stopTreeCensusLoading: (state) => ({ ...state, loading: false }),
  },
  extraReducers: (builder) => {
    builder.addCase(getPlotCensusTreeCensuses.fulfilled, (state, action) => {
      return action.payload;
    });
    builder.addCase(
      createTreeCensus.fulfilled,
      (state, action: { payload: TreeCensus }) => {
        return upsertTreeCensuses(state, {
          data: [action.payload],
          selectFinal: true,
        });
      }
    );
    // builder.addCase(
    //   createTreeCensus.rejected,
    //   (state, action: { payload: any }) => {
    //     console.error(action);
    //     alert("Tree census creation failed.");
    //   }
    // );
    builder.addCase(
      updateTreeCensus.fulfilled,
      (state, action: { payload: TreeCensus }) => {
        return upsertTreeCensuses(state, { data: [action.payload] });
      }
    );
    builder.addCase(deleteTreeCensus.fulfilled, (state, action) => {
      if (action.meta.arg === state.selected) state.selected = undefined;
      return deleteTreeCensuses(state, [action.meta.arg]);
    });
    builder.addCase(locallyDeleteTreeCensus.fulfilled, (state, action) => {
      if (!state.drafts.has(action.payload))
        state.localDeletions.add(action.payload);
      return deleteTreeCensuses(state, [action.payload]);
    });
  },
});

export const {
  addTreeCensuses,
  locallyCreateTreeCensus,
  locallyUpdateTreeCensus,
  selectTreeCensus,
  deselectTreeCensus,
  clearTreeCensusDrafts,
  clearTreeCensusFailed,
  resetTreeCensuses,
  startTreeCensusLoading,
  stopTreeCensusLoading,
} = treeCensusSlice.actions;

export default treeCensusSlice.reducer;
