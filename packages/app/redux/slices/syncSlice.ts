import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";

const initialState = {};

export const uploadCensusData = createAsyncThunk(
  "sync/uploadCensusData",
  async (_params, thunkApi) => {
    const {
      trees: { drafts: treeDrafts },
      treeCensuses: { drafts: treeCensusDrafts },
    } = thunkApi.getState() as RootState;
  }
);

export const syncSlice = createSlice({
  name: "sync",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(uploadCensusData.fulfilled, (state, action) => {
      console.log("E");
    });
  },
});

export default syncSlice.reducer;
