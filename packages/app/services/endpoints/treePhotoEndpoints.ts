import { api } from "../api";
import { TreePhoto } from "@ong-forestry/schema";

const BASE_URL = "trees/photos";

const treePhotoApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getTreePhotoById: builder.query<TreePhoto, string>({
      query: (id) => ({ url: BASE_URL + `?id=${id}` }),
      transformResponse: (response: any) => response?.[0] || null,
    }),
    getTreePhotosByTreeId: builder.query<TreePhoto, string>({
      query: (treeId) => ({ url: BASE_URL + `?treeId=${treeId}` }),
    }),
    createTreePhoto: builder.mutation<TreePhoto, Partial<TreePhoto>>({
      query: (treePhoto) => ({
        url: BASE_URL,
        method: "POST",
        body: treePhoto,
      }),
    }),
    editTreePhoto: builder.mutation<
      TreePhoto,
      Partial<TreePhoto> & { id: string }
    >({
      query: (treePhoto) => ({
        url: BASE_URL + `?id=${treePhoto.id}`,
        method: "PATCH",
        body: treePhoto,
      }),
    }),
    deleteTreePhoto: builder.mutation<TreePhoto, string>({
      query: (id) => ({ url: BASE_URL + `?id=${id}`, method: "DELETE" }),
    }),
  }),
});

export default treePhotoApi;
