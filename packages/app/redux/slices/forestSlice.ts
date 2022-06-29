import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Forest } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";
import { UpsertAction } from "..";

const BASE_URL = SERVER_URL + "forests";

type GetForestParams = {
  id: string;
};

export const getForests = createAsyncThunk(
  "forest/getForests",
  async (teamId: string, { dispatch }) => {
    dispatch(startForestLoading());
    return await axios
      .get<Forest[]>(BASE_URL + `?teamId=${teamId}`)
      .then((response) => {
        dispatch(stopForestLoading());
        return response.data;
      })
      .catch((e) => {
        dispatch(stopForestLoading());
        throw e;
      });
  }
);

export const getForest = createAsyncThunk(
  "forest/getForest",
  async (params: GetForestParams) => {
    return await axios
      .get<Forest[]>(`${BASE_URL}?id=${params.id}`)
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
  const newForests = action.data;
  newForests.forEach((newForest) => {
    state.all[newForest.id] = newForest;
    if (!(newForest.teamId in state.indices.byTeam))
      state.indices.byTeam[newForest.teamId] = new Set([]);
    state.indices.byTeam[newForest.teamId].add(newForest.id);
    if (action.selectFinal) state.selected = newForest.id;
  });
  return state;
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
      return upsertForests(state, { data: action.payload, selectFinal: true });
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
