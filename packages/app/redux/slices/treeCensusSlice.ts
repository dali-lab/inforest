import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TreeCensus } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";
import uuid from "react-native-uuid";
import { isArray } from "lodash";
import { produce } from "immer";

const BASE_URL = SERVER_URL + "trees/censuses";

type GetPlotCensusTreeCensusesParams = {
  plotCensusId: string;
};

type GetForestTreeCensusesParams = {
  forestId: string;
};

export const getPlotCensusTreeCensuses = createAsyncThunk(
  "treeCensus/getPlotCensusTreeCensuses",
  async (params: GetPlotCensusTreeCensusesParams) => {
    return await axios
      .get<TreeCensus[]>(`${BASE_URL}?plotCensusId=${params.plotCensusId}`)
      .then((response) => {
        return response.data;
      });
  }
);

export const getForestTreeCensuses = createAsyncThunk(
  "treeCensus/getForestTreeCensuses",
  async (params: GetForestTreeCensusesParams) => {
    return await axios
      .get<TreeCensus[]>(`${BASE_URL}?forestId=${params.forestId}`)
      .then((response) => {
        return response.data;
      });
  }
);

export const createTreeCensus = createAsyncThunk(
  "treeCensus/createTreeCensus",
  async (newCensus: Partial<TreeCensus>) => {
    return await axios
      .post(`${BASE_URL}`, newCensus)
      .then((response) => response.data);
  }
);

export const updateTreeCensus = createAsyncThunk(
  "treeCensus/updateTreeCensus",
  async (censusUpdates: Partial<TreeCensus>) => {
    const { id, ...updates } = censusUpdates;
    return await axios.patch(`${BASE_URL}/${id}`, updates).then((response) => {
      return response.data;
    });
  }
);

export const deleteTreeCensus = createAsyncThunk(
  "treeCensus/deleteTreeCensus",
  async (id: string) => {
    return await axios
      .delete(`${BASE_URL}/${id}`)
      .then((response) => response.data);
  }
);

// export const uploadTreeCensusDrafts = createAsyncThunk(
//   "treeCensus/uploadTreeCensusDrafts",
//   async (censuses: TreeCensus[], thunkApi) => {
//     // return await axios.post()
//   }
// );

// takes the state and the action payload(!!) and returns the updated state with the payload's censuses added. used for downloading, drafting, and rehydrating
export const upsertTreeCensuses = (state: TreeCensusState, action: any) => {
  let newCensuses;
  if (action?.data) {
    newCensuses = action.data;
  } else newCensuses = action;
  if (!isArray(newCensuses)) newCensuses = [newCensuses];
  newCensuses.forEach((newCensus, i) => {
    if (!newCensus?.id) newCensus.id = uuid.v4();
    state.all[newCensus.id] = newCensus;
    // add to drafts
    if (action?.draft) state.drafts.add(newCensus.id);
    if (!(newCensus.plotCensusId in state.indices.byPlotCensus))
      state.indices.byPlotCensus[newCensus.plotCensusId] = new Set([]);

    state.indices.byPlotCensus[newCensus.plotCensusId].add(newCensus.id);
    if (!(newCensus.treeId in state.indices.byTree))
      state.indices.byTree[newCensus.treeId] = new Set([]);

    state.indices.byTree[newCensus.treeId].add(newCensus.id);

    state.indices.byTreeActive[newCensus.treeId] = newCensus.id;
    if (action?.selectFinal) state.selected = newCensus.id;
  });
  return state;
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
};

export const treeCensusSlice = createSlice({
  name: "treeCensus",
  initialState,
  reducers: {
    locallyCreateTreeCensus: (state, action) => {
      return upsertTreeCensuses(state, {
        data: action.payload,
        draft: true,
        selectFinal: true,
      });
    },
    locallyDeleteTreeCensus: (state, action: { payload: string }) => {
      state.localDeletions.add(action.payload);
      return deleteTreeCensuses(state, [action.payload]);
    },
    locallyUpdateTreeCensus: (state, action) => {
      const { updated } = action.payload;
      state.all[updated.id] = updated;
      return state;
    },
    selectTreeCensus: (state, action) => {
      state.selected = action.payload;
      return state;
    },
    deselectTreeCensus: (state) => {
      state.selected = undefined;
      return state;
    },
    clearTreeCensusDrafts: (state) => {
      return {
        ...state,
        drafts: initialState.drafts,
        localDeletions: initialState.localDeletions,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getForestTreeCensuses.fulfilled, (state, action) => {
      return upsertTreeCensuses(state, action.payload);
    });
    builder.addCase(getPlotCensusTreeCensuses.fulfilled, (state, action) => {
      return upsertTreeCensuses(state, action.payload);
    });
    builder.addCase(createTreeCensus.fulfilled, (state, action) => {
      return upsertTreeCensuses(state, {
        data: action.payload,
        selectFinal: true,
      });
    });
    builder.addCase(updateTreeCensus.fulfilled, (state, action) => {
      return upsertTreeCensuses(state, action.payload);
    });
    builder.addCase(deleteTreeCensus.fulfilled, (state, action) => {
      return deleteTreeCensuses(state, [action.meta.arg]);
    });
  },
});

export const {
  locallyCreateTreeCensus,
  locallyDeleteTreeCensus,
  locallyUpdateTreeCensus,
  selectTreeCensus,
  deselectTreeCensus,
  clearTreeCensusDrafts,
} = treeCensusSlice.actions;

export default treeCensusSlice.reducer;
