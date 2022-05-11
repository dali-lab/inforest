import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { PlotCensus } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";

const BASE_URL = SERVER_URL + "plots/census";

type GetForestCensusPlotCensusesParams = {
  forestCensusId: string;
};

export const getForestCensusPlotCensuses = createAsyncThunk(
  "plotCensus/getForestPlotCensuses",
  async (params: GetForestCensusPlotCensusesParams) => {
    return await axios
      .get<PlotCensus[]>(`${BASE_URL}?forestCensusId=${params.forestCensusId}`)
      .then((response) => {
        return response.data;
      });
  }
);

export interface PlotState {
  all: Record<string, PlotCensus>;
  current: PlotCensus | null;
  indices: {
    byPlots: Record<string, Record<string, PlotCensus>>;
  };
}

const initialState: PlotState = {
  all: {},
  current: null,
  indices: {
    byPlots: {},
  },
};

export const plotCensusSlice = createSlice({
  name: "plotCensus",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getForestCensusPlotCensuses.fulfilled, (state, action) => {
      action.payload.forEach((census) => {
        state.all[census.id] = census;
        // add to plot index under forestCensus key
        if (!(census.plotId in state.indices.byPlots)) {
          state.indices.byPlots[census.plotId] = {};
        }
        state.indices.byPlots[census.plotId][census.forestCensusId] = census;
      });
    });
  },
});

export default plotCensusSlice.reducer;
