import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Team } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";

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
  availableTeams: Team[];
  currentTeam: Team | null;
}

const initialState: TeamState = {
  availableTeams: [],
  currentTeam: null,
};

export const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getTeams.fulfilled, (state, action) => {
      state.availableTeams = action.payload;
      return state;
    });
  },
});

export default teamSlice.reducer;
