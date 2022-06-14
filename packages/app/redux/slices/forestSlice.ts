import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Forest } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";
import { isArray } from "lodash";

const BASE_URL = SERVER_URL + "forests";

type GetForestParams = {
  id: string;
};

export const getForests = createAsyncThunk("forest/getForests", async () => {
  return await axios
    .get<Forest[]>(BASE_URL)
    .then((response) => {
      return response.data;
    })
    .catch((e) => {
      throw e;
    });
});

export const getForest = createAsyncThunk(
  "forest/getForest",
  async (params: GetForestParams) => {
    return await axios
      .get<Forest[]>(`${BASE_URL}?id=${params.id}`)
      .then((response) => {
        return response.data[0];
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
}

const initialState: ForestState = {
  all: {},
  indices: {
    byTeam: {},
  },
  selected: undefined,
};

const upsertForests = (state: ForestState, action: any) => {
  let newForests;
  if (action?.data) {
    newForests = action.data;
  } else newForests = action;
  if (!isArray(newForests)) newForests = [newForests];
  newForests.forEach((newForest) => {
    state.all[newForest.id] = newForest;
    if (!(newForest.teamId in state.indices.byTeam))
      state.indices.byTeam[newForest.teamId] = new Set([]);
    state.indices.byTeam[newForest.teamId].add(newForest.id);
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
  },
  extraReducers: (builder) => {
    builder.addCase(getForests.fulfilled, (state, action) => {
      return upsertForests(state, action.payload);
    });
    builder.addCase(getForest.fulfilled, (state, action) => {
      return upsertForests(state, action.payload);
    });
  },
});

export const { selectForest, resetForests } = forestSlice.actions;

export default forestSlice.reducer;
