import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TreePhotoPurpose } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";

const BASE_URL = SERVER_URL + "trees/photos/purposes";

type GetTreePhotoPurposeParams = {
  limit?: number;
};

export interface TreePhotoPurposeState {
  all: Record<string, TreePhotoPurpose>;
}

const initialState: TreePhotoPurposeState = {
  all: {},
};

export const getAllTreePhotoPurposes = createAsyncThunk(
  "treePhotoPurpose/getAllTreePhotoPurposes",
  async (_params?: GetTreePhotoPurposeParams) => {
    return await axios
      .get<TreePhotoPurpose[]>(`${BASE_URL}`)
      .then((response) => {
        return response.data;
      });
  }
);

export const treePhotoPurposeSlice = createSlice({
  name: "treePhotoPurpose",
  initialState,
  reducers: {
    resetTreePhotoPurposes: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getAllTreePhotoPurposes.fulfilled, (state, action) => {
      action.payload.forEach((treePhotoPurpose) => {
        state.all[treePhotoPurpose.name] = treePhotoPurpose;
      });
      return state;
    });
  },
});

export const { resetTreePhotoPurposes } = treePhotoPurposeSlice.actions;

export default treePhotoPurposeSlice.reducer;
