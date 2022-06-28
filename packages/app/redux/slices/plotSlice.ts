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
  async (params: GetForestPlotsParams) => {
    return await axios
      .get<Plot[]>(`${BASE_URL}?forestId=${params.forestId}`)
      .then((response) => {
        return response.data;
      });
  }
);

type PlotNumericalIndex = {
  value: number;
  plotId: string;
}[];

export interface PlotState {
  all: Record<string, Plot>;
  selected: string | undefined;
  latitude: PlotNumericalIndex;
  longitude: PlotNumericalIndex;
  indices: {
    byNumber: Record<string, Plot>;
  };
}

const initialState: PlotState = {
  all: {},
  selected: undefined,
  latitude: [],
  longitude: [],
  indices: {
    byNumber: {},
  },
};

export const plotSlice = createSlice({
  name: "plot",
  initialState,
  reducers: {
    selectPlot: (state, action) => {
      state.selected = action.payload;
      return state;
    },
    deselectPlot: (state) => {
      state.selected = undefined;
      return state;
    },
    resetPlots: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getForestPlots.fulfilled, (state, action) => {
      action.payload.forEach((plot) => {
        state.all[plot.id] = plot;
        // add to latitude index
        state.latitude.push({
          value: plot.latitude,
          plotId: plot.id,
        });
        // add to longitude index
        state.longitude.push({
          value: plot.longitude,
          plotId: plot.id,
        });
        state.indices.byNumber[plot.number] = plot;
      });
      // sort indices
      state.latitude.sort(({ value: a }, { value: b }) => a - b);
      state.longitude.sort(({ value: a }, { value: b }) => a - b);
    });
  },
});

export const { selectPlot, deselectPlot, resetPlots } = plotSlice.actions;

export default plotSlice.reducer;
