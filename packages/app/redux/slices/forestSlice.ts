import { createSlice } from "@reduxjs/toolkit";
import { Forest } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";
import {
  createAppAsyncThunk,
  RootState,
  throwIfLoadingBase,
  UpsertAction,
} from "../util";
import { produce } from "immer";

const BASE_URL = SERVER_URL + "forests";

type GetForestParams = {
  id: string;
};

const throwIfLoading = throwIfLoadingBase("forest");

export const getForests = createAppAsyncThunk(
  "forest/getForests",
  async (teamId: string, { dispatch, getState }) => {
    throwIfLoading(getState());
    dispatch(startForestLoading());
    return await axios
      .get<Forest[]>(BASE_URL + `?teamId=${teamId}`)
      .finally(() => dispatch(stopForestLoading()))
      .then((response) => {
        return response.data;
      })
      .catch((e) => {
        throw e;
      });
  }
);

export const getForest = createAppAsyncThunk(
  "forest/getForest",
  async (params: GetForestParams, { dispatch, getState }) => {
    throwIfLoading(getState() as RootState);
    dispatch(startForestLoading());
    return await axios
      .get<Forest[]>(`${BASE_URL}?id=${params.id}`)
      .finally(() => dispatch(stopForestLoading()))
      .then((response) => {
        return response.data;
      })
      .catch((e) => {
        throw e;
      });
  }
);
export interface ForestState {
  all: Record<string, Forest>;
  indices: {
    byTeam: Record<string, Set<string>>;
  };
  selected: string | undefined;
  loading: boolean;
}

const initialState: ForestState = {
  all: {},
  indices: {
    byTeam: {},
  },
  selected: undefined,
  loading: false,
};

const upsertForests = (state: ForestState, action: UpsertAction<Forest>) => {
  return produce(
    action?.overwriteNonDrafts ? initialState : state,
    (newState) => {
      const newForests = action.data;
      newForests.forEach((newForest) => {
        newState.all[newForest.id] = newForest;
        if (!(newForest.teamId in newState.indices.byTeam))
          newState.indices.byTeam[newForest.teamId] = new Set([]);
        newState.indices.byTeam[newForest.teamId].add(newForest.id);
        if (action.selectFinal) newState.selected = newForest.id;
      });
    }
  );
};

export const forestSlice = createSlice({
  name: "forest",
  initialState,
  reducers: {
    selectForest: (state, action: { payload: string }) => {
      state.selected = action.payload;
      return state;
    },
    resetForests: () => initialState,
    startForestLoading: (state) => ({ ...state, loading: true }),
    stopForestLoading: (state) => ({ ...state, loading: false }),
  },
  extraReducers: (builder) => {
    builder.addCase(getForests.fulfilled, (state, action) => {
      return upsertForests(state, {
        data: action.payload,
        selectFinal: true,
        overwriteNonDrafts: true,
      });
    });
    builder.addCase(getForest.fulfilled, (state, action) => {
      return upsertForests(state, { data: action.payload });
    });
  },
});

export const {
  selectForest,
  resetForests,
  startForestLoading,
  stopForestLoading,
} = forestSlice.actions;

export default forestSlice.reducer;
