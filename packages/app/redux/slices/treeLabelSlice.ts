import { createSlice } from "@reduxjs/toolkit";
import { TreeLabel } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";
import { createAppAsyncThunk } from "../util";

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

export const getAllTreeLabels = createAppAsyncThunk(
  "treeLabel/getAllTreeSpecies",
  async (_params?: GetTreeLabelsParams) => {
    //TODO: add back limit param
    return await axios.get<TreeLabel[]>(`${BASE_URL}`).then((response) => {
      return response.data;
    });
  }
);

export const treeLabelSlice = createSlice({
  name: "treeLabel",
  initialState,
  reducers: {
    resetTreeLabels: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getAllTreeLabels.fulfilled, (state, action) => {
      action.payload.forEach((treeLabel) => {
        state.all[treeLabel.code] = treeLabel;
      });
      return state;
    });
  },
});

export const { resetTreeLabels } = treeLabelSlice.actions;

export default treeLabelSlice.reducer;
