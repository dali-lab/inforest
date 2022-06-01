import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { PlotCensus } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";
import { isArray } from "lodash";
import uuid from "uuid";

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

const upsertPlotCensuses = (state: PlotCensusState, action: any) => {
  let newCensuses;
  if (action?.data) {
    newCensuses = action.data;
  } else newCensuses = action;
  if (!isArray(newCensuses)) newCensuses = [newCensuses];
  newCensuses.forEach((newCensus) => {
    if (!newCensus?.id) newCensus.id = uuid.v4();
    if (!action?.rehydrate) state.all[newCensus.id] = newCensus;
    if (
      !(newCensus.forestCensusId in state.indices.byForestCensuses) ||
      !(state.indices.byForestCensuses[newCensus.forestCensusId] instanceof Set)
    ) {
      state.indices.byForestCensuses[newCensus.forestCensusId] = new Set();
    }
    state.indices.byForestCensuses[newCensus.forestCensusId].add(newCensus.id);
    if (
      !(newCensus.plotId in state.indices.byPlots) ||
      !(state.indices.byPlots[newCensus.plotId] instanceof Set)
    ) {
      state.indices.byPlots[newCensus.plotId] = new Set();
    }
    state.indices.byPlots[newCensus.plotId].add(newCensus.id);
    if (newCensus.status != "APPROVED")
      state.indices.byPlotActive[newCensus.plotId] = newCensus.id;
    if (action?.selectFinal) state.selected = newCensus.id;
  });
  return state;
};

export const plotCensusSlice = createSlice({
  name: "plotCensus",
  initialState,
  reducers: {
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
      return upsertPlotCensuses(state, action.payload);
    });
    builder.addCase(createPlotCensus.fulfilled, (state, action) => {
      return upsertPlotCensuses(state, {
        data: action.payload,
        selectFinal: true,
      });
    });
  },
});

export const { selectPlotCensus, deselectPlotCensus } = plotCensusSlice.actions;

export default plotCensusSlice.reducer;
