import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ForestCensus } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";
import uuid from "uuid";
import { UpsertAction } from "..";

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

const upsertForestCensuses = (
  state: ForestCensusState,
  action: UpsertAction<ForestCensus>
) => {
  const newCensuses = action.data;
  newCensuses.forEach((newCensus) => {
    if (!newCensus?.id) newCensus.id = uuid.v4();
    state.all[newCensus.id] = newCensus;
    if (!(newCensus.forestId in state.indices.byForests))
      state.indices.byForests[newCensus.forestId] = new Set([]);
    state.indices.byForests[newCensus.forestId].add(newCensus.id);
    if (action?.selectFinal) state.selected = newCensus.id;
  });
  return state;
};

export const forestCensusSlice = createSlice({
  name: "forestCensus",
  initialState,
  reducers: {
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
      return upsertForestCensuses(state, {
        data: [action.payload],
        selectFinal: true,
      });
    });
    builder.addCase(getForestForestCensuses.fulfilled, (state, action) => {
      return upsertForestCensuses(state, {
        data: action.payload,
        selectFinal: true,
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
