import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TreeCensus } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";
import uuid from "react-native-uuid";
import { isArray } from "lodash";

const BASE_URL = SERVER_URL + "trees/census";

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
    return await axios
      .patch(`${BASE_URL}?ids=${id}`, updates)
      .then((response) => {
        return JSON.parse(response.config.data);
      });
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
  newCensuses.forEach((newCensus) => {
    if (!newCensus?.id) newCensus.id = uuid.v4();
    if (!action?.rehydrate) state.all[newCensus.id] = newCensus;
    // add to drafts
    if (action?.draft) state.drafts.add(newCensus.id);
    if (
      !(newCensus.plotCensusId in state.indices.byPlotCensuses) ||
      !state.indices.byPlotCensuses[newCensus.plotCensusId]?.add
    ) {
      state.indices.byPlotCensuses[newCensus.plotCensusId] = new Set();
    }
    state.indices.byPlotCensuses[newCensus.plotCensusId].add(newCensus.id);
    if (
      !(newCensus.treeId in state.indices.byTrees) ||
      !state.indices.byTrees[newCensus.treeId]?.add
    ) {
      state.indices.byTrees[newCensus.treeId] = new Set();
    }
    state.indices.byTrees[newCensus.treeId].add(newCensus.id);
    state.indices.byTreeActive[newCensus.treeId] = newCensus.id;
    if (action?.selectFinal) state.selected = newCensus.id;
  });
  if (action?.rehydrate) state.rehydrated = true;

  return state;
};

export interface TreeCensusState {
  all: Record<string, TreeCensus>;
  indices: {
    byPlotCensuses: Record<string, Set<string>>;
    byTrees: Record<string, Set<string>>;
    byTreeActive: Record<string, string>;
  };
  drafts: Set<string>;
  selected: string | undefined;
  rehydrated: boolean;
}

const initialState: TreeCensusState = {
  all: {},
  indices: {
    byPlotCensuses: {},
    byTrees: {},
    byTreeActive: {},
  },
  drafts: new Set(),
  selected: undefined,
  rehydrated: false,
};

export const treeCensusSlice = createSlice({
  name: "treeCensus",
  initialState,
  reducers: {
    locallyDraftNewTreeCensus: (state, action) => {
      return upsertTreeCensuses(state, {
        data: action.payload,
        draft: true,
        selectFinal: true,
      });
    },
    locallyDeleteTreeCensus: (state, action) => {
      const censusId = action.payload;
      const { plotCensusId } = state.all[censusId];
      delete state.all[censusId];
      state.drafts.delete(censusId);
      state.indices.byPlotCensuses[plotCensusId].delete(censusId);
      state.indices.byTrees[plotCensusId].delete(censusId);
      return state;
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
    rehydrateTreeCensuses: (state) => {
      state.indices = initialState.indices;
      state.selected = undefined;
      return upsertTreeCensuses(state, {
        data: Object.values(state.all),
        rehydrate: true,
      });
    },
    clearTreeCensusDrafts: (state) => {
      return { ...state, drafts: initialState.drafts };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getForestTreeCensuses.fulfilled, (state, action) => {
      action.payload.forEach((census: TreeCensus) => {
        state.all[census.id] = census;
        // initialize plot census index key if needed
        if (!(census.plotCensusId in state.indices.byPlotCensuses)) {
          state.indices.byPlotCensuses[census.plotCensusId] = new Set();
        }
        // add to plots census index
        state.indices.byPlotCensuses[census.plotCensusId].add(census.id);
        if (!(census.treeId in state.indices.byTrees)) {
          state.indices.byTrees[census.treeId] = new Set();
        }
      });
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
  },
});

export const {
  locallyDraftNewTreeCensus,
  locallyDeleteTreeCensus,
  locallyUpdateTreeCensus,
  selectTreeCensus,
  deselectTreeCensus,
  rehydrateTreeCensuses,
  clearTreeCensusDrafts,
} = treeCensusSlice.actions;

export default treeCensusSlice.reducer;
