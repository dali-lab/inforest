import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { PlotCensus } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";

const BASE_URL = SERVER_URL + "plots/census";

type GetForestCensusPlotCensusesParams = {
  forestCensusId: string;
};

export const getPlotCensuses = createAsyncThunk(
  "plotCensus/getPlotCensuses",
  async () => {
    return await axios.get<PlotCensus[]>(`${BASE_URL}`).then((response) => {
      return response.data;
    });
  }
);

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
    byForestCensus: Record<string, Set<string>>;
  };
}

const initialState: PlotState = {
  all: {},
  current: null,
  indices: {
    byPlots: {},
    byForestCensus: {},
  },
};

export const plotCensusSlice = createSlice({
  name: "plotCensus",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getPlotCensuses.fulfilled, (state, action) => {
      action.payload.forEach((census) => {
        state.all[census.id] = census;
        // add to plot index under forestCensus key
        if (!(census.plotId in state.indices.byPlots)) {
          state.indices.byPlots[census.plotId] = {};
        } else {
          state.indices.byPlots[census.plotId][census.forestCensusId] = census;
        }
        if (!(census.forestCensusId in state.indices.byForestCensus)) {
          state.indices.byForestCensus[census.forestCensusId] = new Set([
            census.id,
          ]);
        } else {
          state.indices.byForestCensus[census.forestCensusId].add(census.id);
        }
      });
    });
  },
});

export default plotCensusSlice.reducer;
