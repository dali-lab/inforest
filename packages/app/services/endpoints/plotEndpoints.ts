import { api } from "../api";
import { Plot } from "@ong-forestry/schema";

const BASE_URL = "plots";

const plotApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPlotByNumber: builder.query<Plot, string>({
      query: (number) => ({ url: BASE_URL + `?number=${number}` }),
      transformResponse: (response: any) => response?.[0] || null,
    }),
    getPlotsByForestId: builder.query<Plot[], string>({
      query: (forestId) => ({ url: BASE_URL + `?forestId=${forestId}` }),
    }),
    createPlot: builder.mutation<Plot, Partial<Plot>>({
      query: (plot) => ({ url: BASE_URL, method: "POST", body: plot }),
    }),
    editPlot: builder.mutation<Plot, Partial<Plot> & { id: string }>({
      query: (plot) => ({
        url: BASE_URL + `?id=${plot.id}`,
        method: "PATCH",
        body: plot,
      }),
    }),
    deletePlot: builder.mutation<Plot, string>({
      query: (id) => ({ url: BASE_URL + `?id=${id}`, method: "DELETE" }),
    }),
  }),
});
