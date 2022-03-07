import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Plot } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";

const BASE_URL = SERVER_URL + "plots";

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

type PlotNumericalIndex = {
  value: number;
  plotNumber: string;
}[];

export interface PlotState {
  all: Record<string, Plot>;
  current: Plot | null;
  indices: {
    latitude: PlotNumericalIndex;
    longitude: PlotNumericalIndex;
  };
}

const initialState: PlotState = {
  all: {},
  current: null,
  indices: {
    latitude: [],
    longitude: [],
  },
};

export const plotSlice = createSlice({
  name: "plot",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getForestPlots.fulfilled, (state, action) => {
      action.payload.forEach((plot) => {
        state.all[plot.number] = plot;
        // add to latitude index
        state.indices.latitude.push({
          value: plot.latitude,
          plotNumber: plot.number,
        });
        // add to longitude index
        state.indices.longitude.push({
          value: plot.longitude,
          plotNumber: plot.number,
        });
      });
      // sort indices
      state.indices.latitude.sort(({ value: a }, { value: b }) => a - b);
      state.indices.longitude.sort(({ value: a }, { value: b }) => a - b);
    });
  },
});

export default plotSlice.reducer;
