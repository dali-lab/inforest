import { createSlice } from "@reduxjs/toolkit";
import { ForestCensus } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";
import uuid from "uuid";
import {
  createAppAsyncThunk,
  RootState,
  throwIfLoadingBase,
  UpsertAction,
} from "../util";
import { produce } from "immer";

const BASE_URL = SERVER_URL + "forests/census";

type GetForestCensusParams = {
  id: string;
};

const throwIfLoading = throwIfLoadingBase("forestCensuses");

export const getForestCensus = createAppAsyncThunk(
  "forestCensus/getForestCensus",
  async (params: GetForestCensusParams, { dispatch, getState }) => {
    throwIfLoading(getState());
    dispatch(startForestCensusLoading());
    return await axios
      .get<ForestCensus>(`${BASE_URL}?id=${params.id}`)
      .finally(() => dispatch(stopForestCensusLoading()))
      .then((response) => {
        return response.data;
      });
  }
);

type GetForestForestCensusParams = {
  forestId: string;
};

export const getForestForestCensuses = createAppAsyncThunk(
  "forestCensus/getForestForestCensuses",
  async (params: GetForestForestCensusParams, { dispatch, getState }) => {
    throwIfLoading(getState());
    dispatch(startForestCensusLoading());
    return await axios
      .get<ForestCensus[]>(`${BASE_URL}?forestId=${params.forestId}`)
      .finally(() => dispatch(stopForestCensusLoading()))
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
    byForestActive: Record<string, string>;
  };
  loading: boolean;
}

const initialState: ForestCensusState = {
  all: {},
  selected: undefined,
  indices: {
    byForests: {},
    byForestActive: {},
  },
  loading: false,
};

const upsertForestCensuses = (
  state: ForestCensusState,
  action: UpsertAction<ForestCensus>
) => {
  return produce(
    action?.overwriteNonDrafts ? initialState : state,
    (newState) => {
      const newCensuses = action.data;
      newCensuses.forEach((newCensus) => {
        if (!newCensus?.id) newCensus.id = uuid.v4();
        newState.all[newCensus.id] = newCensus;
        if (!(newCensus.forestId in newState.indices.byForests))
          newState.indices.byForests[newCensus.forestId] = new Set([]);
        newState.indices.byForests[newCensus.forestId].add(newCensus.id);
        if (newCensus.active)
          newState.indices.byForestActive[newCensus.forestId] = newCensus.id;
        if (action?.selectFinal) newState.selected = newCensus.id;
      });
    }
  );
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
        overwriteNonDrafts: true,
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
