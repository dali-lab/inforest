import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Forest } from "@ong-forestry/schema";
import ROOT_URL from "../../constants/Url";
import axios from "axios";

const BASE_URL = ROOT_URL + "forests/";

type GetForestParams = {
  id: string;
};

export const getForests = createAsyncThunk(
  "forest/getForests",
  async (thunkApi) => {
    return await axios.get<Forest[]>(BASE_URL).then((response) => {
      return response.data;
    });
  }
);

export const getForest = createAsyncThunk(
  "forest/getForest",
  async (params: GetForestParams, thunkApi) => {
    return await axios
      .get<Forest>(`${BASE_URL}/${params.id}`)
      .then((response) => {
        return response.data;
      });
  }
);
export interface ForestState {
  currentTeamForests: Forest[];
  currentForest: Forest | null;
}

const initialState: ForestState = {
  currentTeamForests: [],
  currentForest: null,
};

export const forestSlice = createSlice({
  name: "forest",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getForests.fulfilled, (state, action) => {
      state.currentTeamForests = action.payload;
    });
    builder.addCase(getForest.fulfilled, (state, action) => {
      state.currentForest = action.payload;
    });
  },
});

export default forestSlice.reducer;
