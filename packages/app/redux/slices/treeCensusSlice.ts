import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TreeCensus } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";
import uuid from "react-native-uuid";

const BASE_URL = SERVER_URL + "trees/census";

type GetPlotCensusTreeCensusesParams = {
  plotCensusId: string;
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

export const createTreeCensus = createAsyncThunk(
  "treeCensus/createTreeCensus",
  async (newCensus: Omit<TreeCensus, "id">, thunkApi) => {
    return await axios.post(`${BASE_URL}`, newCensus);
  }
);

export const updateTreeCensus = createAsyncThunk(
  "treeCensus/updateTreeCensus",
  async (censusUpdates: Partial<TreeCensus>, thunkApi) => {
    return await axios.patch(
      `${BASE_URL}?ids=${censusUpdates.id}`,
      censusUpdates
    );
  }
);

export const uploadTreeCensusDrafts = createAsyncThunk(
  "treeCensus/uploadTreeCensusDrafts",
  async (censuses: TreeCensus[], thunkApi) => {
    // return await axios.post()
  }
);

export interface TreeCensusState {
  all: Record<string, TreeCensus>;
  indices: {
    byPlotCensuses: Record<string, Set<string>>;
    byTrees: Record<string, Set<string>>;
    byTreeActive: Record<string, string>;
  };
  drafts: Set<string>;
  selected?: string;
}

const initialState: TreeCensusState = {
  // all currently is indexed by the treeTag, but likely change this in the future
  all: {},
  indices: {
    byPlotCensuses: {},
    byTrees: {},
    byTreeActive: {},
  },
  drafts: new Set(),
  selected: undefined,
};

export const treeCensusSlice = createSlice({
  name: "treeCensus",
  initialState,
  reducers: {
    locallyDraftNewTreeCensus: (state, action) => {
      const { newCensus } = action.payload;
      newCensus.id = uuid.v4();
      state.all[newCensus.id] = newCensus;
      // add to drafts
      state.drafts.add(newCensus.id);
      if (!(newCensus.plotCensusId in state.indices.byPlotCensuses)) {
        state.indices.byPlotCensuses[newCensus.plotCensusId] = new Set();
      }
      state.indices.byPlotCensuses[newCensus.plotCensusId].add(newCensus.id);
      if (!(newCensus.treeId in state.indices.byTrees)) {
        state.indices.byTrees[newCensus.treeId] = new Set();
      }
      state.indices.byTrees[newCensus.treeId].add(newCensus.id);
      state.indices.byTreeActive[newCensus.treeId] = newCensus.id;
      return state;
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
      const { censusId, updates } = action.payload;
      const oldTreeCensus = state.all[censusId];
      state.all[censusId] = { ...oldTreeCensus, ...updates };
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
  },
  extraReducers: (builder) => {
    builder.addCase(getPlotCensusTreeCensuses.fulfilled, (state, action) => {
      action.payload.forEach((census: TreeCensus) => {
        const { id, plotCensusId, plotCensus, treeId } = census;
        state.all[id] = census;
        if (!(plotCensusId in state.indices.byPlotCensuses)) {
          state.indices.byPlotCensuses[plotCensusId] = new Set();
        }
        state.indices.byPlotCensuses[plotCensusId].add(id);
        if (!(treeId in state.indices.byTrees)) {
          state.indices.byTrees[treeId] = new Set();
        }
        state.indices.byTrees[treeId].add(id);
        // This only works if there is only one active census on a plot at any given time, which should hold true
        if (
          plotCensus?.status === "PENDING" ||
          plotCensus?.status === "IN_PROGRESS"
        ) {
          state.indices.byTreeActive[treeId] = id;
        }
      });
      return state;
    });
  },
});

export const {
  locallyDraftNewTreeCensus,
  locallyDeleteTreeCensus,
  locallyUpdateTreeCensus,
  selectTreeCensus,
  deselectTreeCensus,
} = treeCensusSlice.actions;

export default treeCensusSlice.reducer;
