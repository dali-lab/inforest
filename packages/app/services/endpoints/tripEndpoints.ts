import { api } from "../api";
import { Trip } from "@ong-forestry/schema";

const BASE_URL = "trips";

const tripApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getTripById: builder.query<Trip, string>({
      query: (id) => ({ url: BASE_URL + `?id=${id}` }),
    }),
    getTripsByTeamId: builder.query<Trip[], string>({
      query: (teamId) => ({ url: BASE_URL + `?teamId=${teamId}` }),
    }),
    getTripsByForestId: builder.query<Trip[], string>({
      query: (forestId) => ({ url: BASE_URL + `?forestId=${forestId}` }),
    }),
    createTrip: builder.mutation<Trip, Partial<Trip>>({
      query: (trip) => ({ url: BASE_URL, method: "POST", body: trip }),
    }),
    editTrip: builder.mutation<Trip, Partial<Trip> & { id: string }>({
      query: (trip) => ({
        url: BASE_URL + `?id=${trip.id}`,
        method: "PATCH",
        body: trip,
      }),
    }),
    deleteTrip: builder.mutation<Trip, string>({
      query: (id) => ({ url: BASE_URL + `?id=${id}`, method: "DELETE" }),
    }),
  }),
});

export default tripApi;
