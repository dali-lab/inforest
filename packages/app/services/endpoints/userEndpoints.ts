import { api } from "../api";
import { User, Membership, MembershipRoles } from "@ong-forestry/schema";

const BASE_URL = "users";

const userApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // TODO: figure out cookies and stuff
    signup: builder.mutation<User, any>({
      query: (credentials) => ({
        url: BASE_URL + "/signup",
        method: "POST",
        body: credentials,
      }),
    }),
    login: builder.mutation<{ user: User; token: string }, any>({
      query: (credentials) => ({
        url: BASE_URL + "/login",
        method: "POST",
        body: credentials,
      }),
      // eventually we'll want to automatically dispatch the redux setCredentials from here
      onCacheEntryAdded: async () => {},
    }),
    getUserById: builder.query<User, string>({
      query: (id) => ({ url: BASE_URL + `?id=${id}` }),
      transformResponse: (response: any) => response?.[0] || null,
    }),
    // TODO: how to make it so that user can only edit self?
    editUser: builder.query<User, Partial<User> & { id: string }>({
      query: (user) => ({
        url: BASE_URL + `?id=${user.id}`,
        method: "PATCH",
        body: user,
      }),
    }),
    // getTeamMembers: builder.query<User[], number>({
    //   query: (teamId) => ({
    //     url: `memberships?role=${MembershipRoles.Member}&teamId=${teamId}`,
    //   }),
    // }),
  }),
});

export default userApi;
