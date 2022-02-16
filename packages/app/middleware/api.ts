import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  // TODO: add real base URL
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
  endpoints: (builder) => ({}),
});
