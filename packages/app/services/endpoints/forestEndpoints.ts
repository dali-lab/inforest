import { api } from "../api";
import { Forest } from "@ong-forestry/schema";

const BASE_URL = "forests";

const forestApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getForestById: builder.query<Forest, string>({
      query: (id) => ({ url: BASE_URL + `?id=${id}` }),
      transformResponse: (response: any) => response?.[0] || null,
    }),
    getForestsByTeamId: builder.query<Forest[], string>({
      query: (teamId) => ({ url: BASE_URL + `?teamId=${teamId}` }),
    }),
    createForest: builder.mutation<Forest, Partial<Forest>>({
      query: (forest) => ({ url: BASE_URL, method: "POST", body: forest }),
    }),
    editForest: builder.mutation<Forest, Partial<Forest> & { id: string }>({
      query: (forest) => ({
        url: BASE_URL + `?id=${forest.id}`,
        method: "PATCH",
        body: forest,
      }),
    }),
    deleteForest: builder.mutation<Forest, string>({
      query: (id) => ({ url: BASE_URL + `?id=${id}`, method: "DELETE" }),
    }),
  }),
});
