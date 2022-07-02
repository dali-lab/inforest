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
  async (params: GetForestCensusParams, { dispatch }) => {
    dispatch(startForestCensusLoading());
    return await axios
      .get<ForestCensus>(`${BASE_URL}?id=${params.id}`)
      .then((response) => {
        dispatch(stopForestCensusLoading());
        return response.data;
      });
  }
);

type GetForestForestCensusParams = {
  forestId: string;
};

export const getForestForestCensuses = createAsyncThunk(
  "forestCensus/getForestForestCensuses",
  async (params: GetForestForestCensusParams, { dispatch }) => {
    dispatch(startForestCensusLoading());
    return await axios
      .get<ForestCensus[]>(`${BASE_URL}?forestId=${params.forestId}`)
      .then((response) => {
        dispatch(stopForestCensusLoading());
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
  loading: boolean;
}

const initialState: ForestCensusState = {
  all: {},
  selected: undefined,
  indices: {
    byForests: {},
  },
  loading: false,
};

export const forestCensusSlice = createSlice({
  name: "forestCensus",
  initialState,
  reducers: {
    createForestCensus: (state, action) => {
      const census = action.payload;
      state.all[census.id] = census;
      // add to plot index under forestCensus key
      if (!(census.forestId in state.indices.byForests))
        state.indices.byForests[census.forestId] = new Set([]);

      state.indices.byForests[census.forestId].add(census.id);
    },
    selectForestCensus: (state, action: { payload: string }) => {
      state.selected = action.payload;
      return state;
    },
    deselectForestCensus: (state, _action) => {
      state.selected = undefined;
      return state;
    },
    resetForestCensuses: () => initialState,
    startForestCensusLoading: (state) => ({ ...state, loading: true }),
    stopForestCensusLoading: (state) => ({ ...state, loading: false }),
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

export const {
  selectForestCensus,
  deselectForestCensus,
  resetForestCensuses,
  startForestCensusLoading,
  stopForestCensusLoading,
} = forestCensusSlice.actions;

export default forestCensusSlice.reducer;
