import { createSlice } from "@reduxjs/toolkit";
import { Trip } from "@ong-forestry/schema";
import ROOT_URL from "../../constants/Url";

const BASE_URL = ROOT_URL + "trips/";

export interface TripState {
  currentForestTrips: Trip[];
  currentTrip: Trip | null;
}

const initialState: TripState = {
  currentForestTrips: [],
  currentTrip: null,
};

export const tripSlice = createSlice({
  name: "trip",
  initialState,
  reducers: {},
  extraReducers: {},
});

export default tripSlice.reducer;
