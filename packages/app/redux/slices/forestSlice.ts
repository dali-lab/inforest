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
      .get<Forest>(`${BASE_URL}?id=${params.id}`)
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
