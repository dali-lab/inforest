import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ForestCensus } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";

const BASE_URL = SERVER_URL + "forests/census";

type GetForestCensusParams = {
  id: string;
};

export const getForestCensus = createAsyncThunk(
  "forestCensus/getForestCensus",
  async (params: GetForestCensusParams) => {
    return await axios
      .get<ForestCensus>(`${BASE_URL}?id=${params.id}`)
      .then((response) => {
        return response.data;
      });
  }
);

type GetForestForestCensusParams = {
  forestId: string;
};

export const getForestForestCensuses = createAsyncThunk(
  "forestCensus/getForestForestCensuses",
  async (params: GetForestForestCensusParams) => {
    return await axios
      .get<ForestCensus[]>(`${BASE_URL}?forestId=${params.forestId}`)
      .then((response) => {
        return response.data;
      });
  }
);

export interface ForestCensusState {
  all: Record<string, ForestCensus>;
  selected: string | undefined;
  indices: {
    byForests: Record<string, Set<string>>;
  };
}

const initialState: ForestCensusState = {
  all: {},
  selected: undefined,
  indices: {
    byForests: {},
  },
};

export const forestCensusSlice = createSlice({
  name: "forestCensus",
  initialState,
  reducers: {
    createForestCensus: (state, action) => {
      const census = action.payload;
      state.all[census.id] = census;
      // add to plot index under forestCensus key
      if (
        !(census.forestId in state.indices.byForests) ||
        !(state.indices.byForests[census.forestId] instanceof Set)
      ) {
        state.indices.byForests[census.forestId] = new Set();
      }
      state.indices.byForests[census.forestId].add(census.id);
    },
    selectForestCensus: (state, action) => {
      state.selected = action.payload;
      return state;
    },
    deselectForestCensus: (state, _action) => {
      state.selected = undefined;
      return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getForestCensus.fulfilled, (state, action) => {
      forestCensusSlice.caseReducers.createForestCensus(state, action);
    });
    builder.addCase(getForestForestCensuses.fulfilled, (state, action) => {
      action.payload.forEach((census) => {
        // set selected to be active census
        if (census.active) {
          state.selected = census.id;
        }       
          forestCensusSlice.caseReducers.createForestCensus(state, {
          payload: census,
          type: "forestCensus/createForestCensus",
        });
      });
    });
  },
});

export const { selectForestCensus, deselectForestCensus } =
  forestCensusSlice.actions;

export default forestCensusSlice.reducer;
