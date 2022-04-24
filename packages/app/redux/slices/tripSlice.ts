import { createSlice } from "@reduxjs/toolkit";
import { Trip } from "@ong-forestry/schema";
// import SERVER_URL from "../../constants/Url";

// const BASE_URL = SERVER_URL + "trips/";

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
