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
  async (newCensus: Omit<TreeCensus, "id">) => {
    return await axios.post(`${BASE_URL}`, newCensus);
  }
);

export const updateTreeCensus = createAsyncThunk(
  "treeCensus/updateTreeCensus",
  async (censusUpdates: Partial<TreeCensus>) => {
    return await axios.patch(
      `${BASE_URL}?ids=${censusUpdates.id}`,
      censusUpdates
    );
  }
);

// export const uploadTreeCensusDrafts = createAsyncThunk(
//   "treeCensus/uploadTreeCensusDrafts",
//   async (censuses: TreeCensus[], thunkApi) => {
//     // return await axios.post()
//   }
// );

// takes the state and the action payload(!!) and returns the updated state with the payload's censuses added. used for downloading, drafting, and rehydrating
const addTreeCensuses = (state: TreeCensusState, action: any) => {
  let newCensuses;
  if (action?.draft || action?.rehydrate) {
    newCensuses = action.data;
  } else newCensuses = action;
  if (!isArray(newCensuses)) newCensuses = [newCensuses];
  newCensuses.forEach((newCensus) => {
    newCensus.id = uuid.v4();
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
    if (action?.draft) state.selected = newCensus.id;
  });
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
};

export const treeCensusSlice = createSlice({
  name: "treeCensus",
  initialState,
  reducers: {
    createTreeCensus: (state, action) => {
      return addTreeCensuses(state, action.payload);
    },
    locallyDraftNewTreeCensus: (state, action) => {
      treeCensusSlice.caseReducers.createTreeCensus(state, {
        payload: { data: action.payload, draft: true },
        type: "treeCensus/createTreeCensus",
      });
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
      return addTreeCensuses(state, {
        data: Object.values(state.all),
        rehydrate: true,
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getPlotCensusTreeCensuses.fulfilled, (state, action) => {
      return addTreeCensuses(state, action.payload);
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
} = treeCensusSlice.actions;

export default treeCensusSlice.reducer;
