import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Plot } from "@ong-forestry/schema";
import ROOT_URL from "../../constants/Url";
import axios from "axios";

const BASE_URL = ROOT_URL + "plots";

type GetForestPlotsParams = {
  forestId: string;
};

export const getForestPlots = createAsyncThunk(
  "plot/getForestPlots",
  async (params: GetForestPlotsParams, thunkApi) => {
    return await axios
      .get<Plot[]>(`${BASE_URL}?forestId=${params.forestId}`)
      .then((response) => {
        return response.data;
      });
  }
);

export interface PlotState {
  currentForestPlots: Record<string, Plot>;
  currentPlot: Plot | null;
}

const initialState: PlotState = {
  currentForestPlots: {},
  currentPlot: null,
};

export const plotSlice = createSlice({
  name: "plot",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getForestPlots.fulfilled, (state, action) => {
      action.payload.forEach((plot) => {
        state.currentForestPlots[plot.number] = plot;
      });
    });
  },
});

export default plotSlice.reducer;
