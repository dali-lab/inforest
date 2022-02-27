import { api } from "../api";
import { Tree } from "@ong-forestry/schema";

const BASE_URL = "trees";

const treeApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getTreeById: builder.query<Tree, string>({
      query: (id) => ({ url: BASE_URL + `?id=${id}` }),
      transformResponse: (response: any) => response?.[0] || null,
    }),
    getTreesByPlotId: builder.query<Tree[], string>({
      query: (plotId) => ({ url: BASE_URL + `?plotId=${plotId}` }),
    }),
    getTreesByTripId: builder.query<Tree[], string>({
      query: (tripId) => ({ url: BASE_URL + `?tripId=${tripId}` }),
    }),
    createTree: builder.mutation<Tree, Partial<Tree>>({
      query: (tree) => ({ url: BASE_URL, method: "POST", body: tree }),
    }),
    editTree: builder.mutation<Tree, Partial<Tree> & { id: string }>({
      query: (tree) => ({
        url: BASE_URL + `?id=${tree.id}`,
        method: "PATCH",
        body: tree,
      }),
    }),
    deleteTree: builder.mutation<Tree, string>({
      query: (id) => ({ url: BASE_URL + `?id=${id}`, method: "DELETE" }),
    }),
  }),
});

export default treeApi;
