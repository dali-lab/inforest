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
  async (params?: GetTreePhotoPurposeParams) => {
    //TODO: add back limit
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
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllTreePhotoPurposes.fulfilled, (state, action) => {
      action.payload.forEach((treePhotoPurpose) => {
        state.all[treePhotoPurpose.name] = treePhotoPurpose;
      });
      return state;
    });
  },
});

export default treePhotoPurposeSlice.reducer;
