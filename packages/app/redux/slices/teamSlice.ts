import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Team } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";
import { UpsertAction } from "..";

const BASE_URL = SERVER_URL + "teams/";

export const getTeams = createAsyncThunk(
  "team/getTeams",
  async (userId: string) => {
    return await axios
      .get<Team[]>(`${BASE_URL}?userId=${userId}`)
      .then((response) => response.data)
      .catch((err) => {
        throw err;
      });
  }
);

export interface TeamState {
  availableTeams: Record<string, Team>;
  currentTeam: string | null;
}

const initialState: TeamState = {
  availableTeams: {},
  currentTeam: null,
};

const upsertTeams = (state: TeamState, action: UpsertAction<Team>) => {
  const newTeams: Team[] = action.data;
  newTeams.forEach((newTeam) => {
    state.availableTeams[newTeam.id] = newTeam;
    if (action?.selectFinal) state.currentTeam = newTeam.id;
  });
  return state;
};

export const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getTeams.fulfilled, (state, action) => {
      return upsertTeams(state, { data: action.payload, selectFinal: true });
    });
  },
});

export default teamSlice.reducer;
