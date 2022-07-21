import { createSlice } from "@reduxjs/toolkit";
import { Plot } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";
import { UpsertAction, createAppAsyncThunk } from "../util";
import { produce } from "immer";

const BASE_URL = SERVER_URL + "plots";

type GetForestPlotsParams = {
  forestId: string;
};

export const getForestPlots = createAppAsyncThunk(
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
    byNumber: Record<string, string>;
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

const upsertPlots = (state: PlotState, action: UpsertAction<Plot>) => {
  return produce(
    action?.overwriteNonDrafts ? initialState : state,
    (newState) => {
      const newPlots = action.data;
      newPlots.forEach((newPlot) => {
        newState.all[newPlot.id] = newPlot;
        // add to latitude index
        newState.latitude.push({
          value: newPlot.latitude,
          plotId: newPlot.id,
        });
        // add to longitude index
        newState.longitude.push({
          value: newPlot.longitude,
          plotId: newPlot.id,
        });
        newState.indices.byNumber[newPlot.number] = newPlot.id;
      });
      // sort indices
      newState.latitude.sort(({ value: a }, { value: b }) => a - b);
      newState.longitude.sort(({ value: a }, { value: b }) => a - b);
    }
  );
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
      return upsertPlots(state, {
        data: action.payload,
        overwriteNonDrafts: true,
      });
    });
  },
});

export const { selectPlot, deselectPlot, resetPlots } = plotSlice.actions;

export default plotSlice.reducer;
