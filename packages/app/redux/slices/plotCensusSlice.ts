import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { PlotCensus } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";
import uuid from "uuid";
import { UpsertAction } from "..";
import { cloneDeep } from "lodash";

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

export const createPlotCensus = createAsyncThunk(
  "plotCensus/createPlotCensus",
  async (plotId: string) => {
    return await axios.post(`${BASE_URL}/${plotId}`).then((response) => {
      return response.data;
    });
  }
);

export const submitPlotCensus = createAsyncThunk(
  "plotCensus/submitPlotCensus",
  async (plotId: string, { dispatch }) => {
    dispatch(startPlotCensusLoading());
    return await axios
      .patch(`${BASE_URL}/submit/${plotId}`)
      .then((response) => {
        dispatch(stopPlotCensusLoading());
        return response.data;
      })
      .catch((err) => {
        dispatch(stopPlotCensusLoading());
        alert("Error: could not submit plot census");
        throw err;
      });
  }
);

export interface PlotCensusState {
  all: Record<string, PlotCensus>;
  selected: string | undefined;
  indices: {
    byForestCensuses: Record<string, Set<string>>;
    byPlots: Record<string, Set<string>>;
  };
  loading: boolean;
}

const initialState: PlotCensusState = {
  all: {},
  selected: undefined,
  indices: {
    byForestCensuses: {},
    byPlots: {},
  },
  loading: false,
};

const upsertPlotCensuses = (
  state: PlotCensusState,
  action: UpsertAction<PlotCensus>
) => {
  if (action?.overwriteNonDrafts) state = cloneDeep(initialState);
  const newCensuses = action.data;
  newCensuses.forEach((newCensus) => {
    if (!newCensus?.id) newCensus.id = uuid.v4();
    state.all[newCensus.id] = newCensus;
    if (!(newCensus.forestCensusId in state.indices.byForestCensuses))
      state.indices.byForestCensuses[newCensus.forestCensusId] = new Set([]);
    state.indices.byForestCensuses[newCensus.forestCensusId].add(newCensus.id);
    if (!(newCensus.plotId in state.indices.byPlots))
      state.indices.byPlots[newCensus.plotId] = new Set([]);
    state.indices.byPlots[newCensus.plotId].add(newCensus.id);
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
    resetPlotCensuses: () => initialState,
    startPlotCensusLoading: (state) => ({ ...state, loading: true }),
    stopPlotCensusLoading: (state) => ({ ...state, loading: false }),
  },
  extraReducers: (builder) => {
    builder.addCase(getPlotCensuses.fulfilled, (state, action) => {
      return upsertPlotCensuses(state, {
        data: action.payload,
        overwriteNonDrafts: true,
      });
    });
    builder.addCase(getForestCensusPlotCensuses.fulfilled, (state, action) => {
      return upsertPlotCensuses(state, {
        data: action.payload,
        overwriteNonDrafts: true,
      });
    });
    builder.addCase(createPlotCensus.fulfilled, (state, action) => {
      alert("Successfully assigned self to plot.");
      return upsertPlotCensuses(state, {
        data: [action.payload],
        selectFinal: true,
      });
    });
    builder.addCase(createPlotCensus.rejected, () => {
      alert(
        "Plot self-assignment failed. You either do not have the permissions to do this or a server error has occurred."
      );
    });
    builder.addCase(submitPlotCensus.fulfilled, (state, action) => {
      return upsertPlotCensuses(state, { data: action.payload });
    });
  },
});

export const {
  selectPlotCensus,
  deselectPlotCensus,
  resetPlotCensuses,
  startPlotCensusLoading,
  stopPlotCensusLoading,
} = plotCensusSlice.actions;

export default plotCensusSlice.reducer;
