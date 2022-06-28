import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TreeSpecies } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";

const BASE_URL = SERVER_URL + "trees/species";

type GetTreeSpeciesParams = {
  code: string;
};

export const getTreeSpecies = createAsyncThunk(
  "treeSpecies/getTreeSpecies",
  async (params: GetTreeSpeciesParams) => {
    return await axios
      .get<TreeSpecies[]>(`${BASE_URL}?code=${params.code}`)
      .then((response) => {
        return response.data;
      });
  }
);

type GetManyTreeSpeciesParams = {
  codes: string[];
};

export const getManyTreeSpecies = createAsyncThunk(
  "treeSpecies/getManyTreeSpecies",
  async (params: GetManyTreeSpeciesParams) => {
    return await axios
      .get<TreeSpecies[]>(`${BASE_URL}?codes=${params.codes}`)
      .then((response) => {
        return response.data;
      });
  }
);

export const getAllTreeSpecies = createAsyncThunk(
  "treeSpecies/getAllTreeSpecies",
  async () => {
    return await axios.get<TreeSpecies[]>(`${BASE_URL}`).then((response) => {
      return response.data;
    });
  }
);

export interface TreeSpeciesState {
  all: Record<string, TreeSpecies>;
  colorMap: Record<string, string>;
  frequencyMap: Record<string, number>;
}

const initialState: TreeSpeciesState = {
  all: {},
  colorMap: {},
  frequencyMap: {},
};

export const treeSpeciesSlice = createSlice({
  name: "treeSpecies",
  initialState,
  reducers: {
    resetTreeSpecies: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getTreeSpecies.fulfilled, (state, action) => {
      action.payload.forEach((treeSpecies) => {
        state.all[treeSpecies.code] = treeSpecies;
      });
      return state;
    });
    builder.addCase(getManyTreeSpecies.fulfilled, (state, action) => {
      action.payload.forEach((treeSpecies) => {
        state.all[treeSpecies.code] = treeSpecies;
      });
      return state;
    });
    builder.addCase(getAllTreeSpecies.fulfilled, (state, action) => {
      action.payload.forEach((treeSpecies) => {
        state.all[treeSpecies.code] = treeSpecies;
        if (!(treeSpecies.code in state.colorMap)) {
          let uniqueHue: string;
          // this is a poor way to do this, change later
          do {
            uniqueHue = `hsl(${Math.round(Math.random() * 36) * 10},${
              Math.round(Math.random() * 40) + 60
            }%,${Math.round(Math.random() * 40) + 20}%)`;
          } while (Object.values(state.colorMap).includes(uniqueHue));
          state.colorMap[treeSpecies.code] = uniqueHue;
        }
        if (!(treeSpecies.code in state.frequencyMap)) {
          state.frequencyMap[treeSpecies.code] = 0;
        }
        state.frequencyMap[treeSpecies.code] += 1;
      });
      return state;
    });
  },
});

export const { resetTreeSpecies } = treeSpeciesSlice.actions;

export default treeSpeciesSlice.reducer;
