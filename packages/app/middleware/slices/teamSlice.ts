import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Team } from "@ong-forestry/schema";

export interface TeamState {
  currentTeam: Team | null;
}

const initialState: TeamState = {
  currentTeam: null,
};
