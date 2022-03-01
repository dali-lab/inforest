import { createSlice } from "@reduxjs/toolkit";
import { Team } from "@ong-forestry/schema";
import ROOT_URL from "../../constants/Url";

const BASE_URL = ROOT_URL + "trees/";

export interface TeamState {
  currentUserTeams: Team[];
  currentTeam: Team | null;
}

const initialState: TeamState = {
  currentUserTeams: [],
  currentTeam: null,
};

export const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {},
  extraReducers: {},
});

export default teamSlice.reducer;
