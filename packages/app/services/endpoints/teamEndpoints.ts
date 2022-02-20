import { api } from "../api";
import { Team } from "@ong-forestry/schema";

const BASE_URL = "teams";

const teamApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getTeamById: builder.query<Team, string>({
      query: (id) => ({ url: BASE_URL + `?id=${id}` }),
      transformResponse: (response: any) => response?.[0] || null,
    }),
    createTeam: builder.mutation<Team, Partial<Team>>({
      query: (team) => ({ url: BASE_URL, method: "POST", body: team }),
    }),
    editTeam: builder.mutation<Team, Partial<Team> & { id: string }>({
      query: (team) => ({
        url: BASE_URL + `?id=${team.id}`,
        method: "PATCH",
        body: team,
      }),
    }),
    deleteTeam: builder.mutation<Team, string>({
      query: (id) => ({ url: BASE_URL + `?id=${id}`, method: "DELETE" }),
    }),
  }),
});
