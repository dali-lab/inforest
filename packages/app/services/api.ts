import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as endpoints from "./endpoints";
import { Plot } from "@ong-forestry/schema";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/" }),
  endpoints: (builder) => ({
    getPlotByNumber: builder.query<Plot, number>({
      query: (number) => ({ url: `plots?number=${number}` }),
      transformResponse: (response: any) => response?.[0] || null,
    }),
    getPlotsByForestId: builder.query<Plot[], string>({
      query: (id) => ({ url: "plots", data: { forestId: id } }),
    }),
  }),
});

export const { useGetPlotByNumberQuery } = api;
