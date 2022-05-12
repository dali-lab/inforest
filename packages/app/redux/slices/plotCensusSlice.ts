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

export const createPlotCensus = createAsyncThunk(
  "plotCensus/createPlotCensus",
  async (plotId: string) => {
    return await axios.post(`${BASE_URL}/${plotId}`).then((response) => {
      return response.data;
    });
  }
);

export interface PlotCensusState {
  all: Record<string, PlotCensus>;
  selected: string | undefined;
  indices: {
    byForestCensuses: Record<string, Set<string>>;
    byPlots: Record<string, Set<string>>;
    byPlotActive: Record<string, string>;
  };
}

const initialState: PlotCensusState = {
  all: {},
  selected: undefined,
  indices: {
    byForestCensuses: {},
    byPlots: {},
    byPlotActive: {},
  },
};

export const plotCensusSlice = createSlice({
  name: "plotCensus",
  initialState,
  reducers: {
    addPlotCensus: (state, action) => {
      const newCensus = action.payload;
      console.log(action.payload);
      state.all[newCensus.id] = newCensus;
      if (!(newCensus.forestCensusId in state.indices.byForestCensuses)) {
        state.indices.byForestCensuses[newCensus.forestCensusId] = new Set();
      }
      state.indices.byForestCensuses[newCensus.forestCensusId].add(
        newCensus.id
      );
      if (!(newCensus.plotId in state.indices.byPlots)) {
        state.indices.byPlots[newCensus.plotId] = new Set();
      }
      state.indices.byPlots[newCensus.plotId].add(newCensus.id);
      if (newCensus.status != "APPROVED")
        state.indices.byPlotActive[newCensus.plotId] = newCensus.id;
    },
    selectPlotCensus: (state, action) => {
      state.selected = action.payload;
      return state;
    },
    deselectPlotCensus: (state) => {
      state.selected = undefined;
      return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getForestCensusPlotCensuses.fulfilled, (state, action) => {
      action.payload.forEach((census) => {
        state.all[census.id] = census;
        if (!(census.forestCensusId in state.indices.byForestCensuses)) {
          state.indices.byForestCensuses[census.forestCensusId] = new Set();
        }
        state.indices.byForestCensuses[census.forestCensusId].add(census.id);
        if (!(census.plotId in state.indices.byPlots)) {
          state.indices.byPlots[census.plotId] = new Set();
        }
        state.indices.byPlots[census.plotId].add(census.id);
        if (census.status != "APPROVED")
          state.indices.byPlotActive[census.plotId] = census.id;
      });
    });
    builder.addCase(createPlotCensus.fulfilled, (state, action) => {
      plotCensusSlice.caseReducers.addPlotCensus(state, action);
    });
  },
});

export const { selectPlotCensus, deselectPlotCensus } = plotCensusSlice.actions;

export default plotCensusSlice.reducer;
