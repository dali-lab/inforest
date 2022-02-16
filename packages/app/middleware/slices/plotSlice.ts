import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Plot } from "@ong-forestry/schema";

export interface PlotState {
  currentPlot: Plot | null;
}

const initialState: PlotState = {
  currentPlot: null,
};
