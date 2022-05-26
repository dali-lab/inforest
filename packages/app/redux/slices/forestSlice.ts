import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Forest } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";

const BASE_URL = SERVER_URL + "forests";

type GetForestParams = {
  id: string;
};

export const getForests = createAsyncThunk("forest/getForests", async () => {
  return await axios.get<Forest[]>(BASE_URL).then((response) => {
    return response.data;
  });
});

export const getForest = createAsyncThunk(
  "forest/getForest",
  async (params: GetForestParams) => {
    return await axios
      .get<Forest[]>(`${BASE_URL}?id=${params.id}`)
      .then((response) => {
        return response.data[0];
      });
  }
);
export interface ForestState {
  currentTeamForests: Forest[];
  currentForest?: Forest;
}

const initialState: ForestState = {
  currentTeamForests: [],
  currentForest: undefined,
};

export const forestSlice = createSlice({
  name: "forest",
  initialState,
  reducers: {
    changeForest: (state, action) => {
      state.currentForest = state.currentTeamForests.find(
        (forest) => forest.id === action.payload.id
      );
      return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getForests.fulfilled, (state, action) => {
      state.currentTeamForests = action.payload;
    });
    builder.addCase(getForest.fulfilled, (state, action) => {
      state.currentForest = action.payload;
    });
  },
});

export const { changeForest } = forestSlice.actions;

export default forestSlice.reducer;
