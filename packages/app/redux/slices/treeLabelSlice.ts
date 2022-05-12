import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TreeLabel } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";

const BASE_URL = SERVER_URL + "trees/labels";

type GetTreeLabelsParams = {
  limit?: number;
};

export interface TreeLabelState {
  all: Record<string, TreeLabel>;
}

const initialState: TreeLabelState = {
  all: {},
};

export const getAllTreeLabels = createAsyncThunk(
  "treeLabel/getAllTreeSpecies",
  async () => {
    return await axios.get<TreeLabel[]>(`${BASE_URL}`).then((response) => {
      return response.data;
    });
  }
);

export const treeLabelSlice = createSlice({
  name: "treeLabel",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllTreeLabels.fulfilled, (state, action) => {
      action.payload.forEach((treeLabel) => {
        state.all[treeLabel.code] = treeLabel;
      });
      return state;
    });
  },
});

export default treeLabelSlice.reducer;