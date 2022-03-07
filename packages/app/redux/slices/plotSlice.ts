import { createSlice } from "@reduxjs/toolkit";
import { Plot } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";

const BASE_URL = SERVER_URL + "plots";

export interface PlotState {
  currentForestPlots: Plot[];
  currentPlot: Plot | null;
}

const initialState: PlotState = {
  currentForestPlots: [],
  currentPlot: null,
};

export const plotSlice = createSlice({
  name: "plot",
  initialState,
  reducers: {},
  extraReducers: {},
});

export default plotSlice.reducer;
