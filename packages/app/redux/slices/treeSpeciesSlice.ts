import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TreeSpecies } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";

const BASE_URL = SERVER_URL + "trees/species";

type GetTreeSpeciesParams = {
  code: string;
}

export const getTreeSpecies = createAsyncThunk(
  "tree/getTreeSpecies",
  async(params:GetTreeSpeciesParams) => {
    return await axios.get<TreeSpecies[]>(`${BASE_URL}/species?code=${params.code}`).then((response)=>{
      return response.data
    })
  }
)

type GetManyTreeSpeciesParams = {
    codes: string[];
  }

export const getManyTreeSpecies = createAsyncThunk(
    "tree/getManyTreeSpecies",
    async(params:GetManyTreeSpeciesParams) => {
        return await axios.get<TreeSpecies[]>(`${BASE_URL}/species?codes=${params.codes}`).then((response)=>{
          return response.data
        })
      }
)


export interface TreeSpeciesState {
  all: Record<string, TreeSpecies>;
}

const initialState: TreeSpeciesState = {
  all: {},
};

export const treeSpeciesSlice = createSlice({
  name: "treeSpecies",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getTreeSpecies.fulfilled, (state,action)=>{
      action.payload.forEach((treeSpecies)=>{
        state.all[treeSpecies.code] = treeSpecies;
      })
      return state
    })
    builder.addCase(getManyTreeSpecies.fulfilled,(state,action)=>{
        action.payload.forEach((treeSpecies)=>{
            state.all[treeSpecies.code] = treeSpecies;
          })
          return state
    })
  },
});

export default treeSpeciesSlice.reducer;
