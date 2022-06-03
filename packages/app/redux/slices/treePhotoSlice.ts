import { TreePhoto } from "@ong-forestry/schema";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isArray } from "lodash";
import uuid from "uuid";
import axios from "axios";
import { decode } from "base64-arraybuffer";
import SERVER_URL from "../../constants/Url";
import { produce } from "immer";

const BASE_URL = SERVER_URL + "trees/photos";

export interface TreePhotoState {
  all: Record<string, TreePhoto & { buffer?: string }>;
  indices: {
    byTreeCensus: Record<string, Set<string>>;
  };
  drafts: Set<string>;
  rehydrated: boolean;
}

const initialState: TreePhotoState = {
  all: {},
  indices: {
    byTreeCensus: {},
  },
  drafts: new Set(),
  rehydrated: false,
};

export const uploadTreePhoto = createAsyncThunk(
  "treePhoto/uploadTreePhoto",
  async (params: TreePhoto & { buffer: string }, thunkApi) => {
    return await axios.post(BASE_URL, params, {}).then((response) => {
      return response.data;
    });
  }
);

export const upsertTreePhotos = (state: TreePhotoState, action: any) => {
  let newPhotos: TreePhoto[];
  if (action?.draft || action?.rehydrate) {
    newPhotos = action.data;
  } else newPhotos = action;
  if (!isArray(newPhotos)) newPhotos = [newPhotos];
  newPhotos.forEach((newPhoto) => {
    if (!newPhoto?.id) newPhoto.id = uuid.v4().toString();
    if (!action?.rehydrate) state.all[newPhoto.id] = newPhoto;
    // add to drafts
    if (action?.draft) state.drafts.add(newPhoto.id);
    if (
      !(newPhoto.treeCensusId in state.indices.byTreeCensus) ||
      !state.indices.byTreeCensus[newPhoto.treeCensusId]?.add
    ) {
      state.indices.byTreeCensus[newPhoto.treeCensusId] = new Set();
    }
    state.indices.byTreeCensus[newPhoto.treeCensusId].add(newPhoto.id);
  });
  if (action?.rehydrate) state.rehydrated = true;
  return state;
};

export const treePhotoSlice = createSlice({
  name: "treePhoto",
  initialState,
  reducers: {
    createTreePhoto: (state, action) => {
      return upsertTreePhotos(state, action.payload);
    },
    locallyDraftNewPhoto: (state, action) => {
      return upsertTreePhotos(state, { data: action.payload, draft: true });
    },
    locallyDeletePhoto: (state, action) => {
      const photoId = action.payload;
      const censusId = state.all[photoId].treeCensusId;
      delete state.all[photoId];
      state.indices.byTreeCensus[censusId].delete(photoId);
      state.drafts.delete(photoId);
      return state;
    },
    locallyUpdatePhoto: (state, action) => {
      const { updated } = action.payload;
      state.all[updated.id] = updated;
      return state;
    },
    rehydrateTreePhotos: (state) => {
      state.indices = initialState.indices;
      return upsertTreePhotos(state, {
        data: Object.values(state.all),
        rehydrate: true,
      });
    },
    clearTreePhotoDrafts: (state) => {
      return { ...state, drafts: initialState.drafts };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(uploadTreePhoto.fulfilled, (state, action: any) => {
      return upsertTreePhotos(state, action.payload.data);
    });
  },
});

export const {
  createTreePhoto,
  locallyDraftNewPhoto,
  locallyDeletePhoto,
  locallyUpdatePhoto,
  rehydrateTreePhotos,
  clearTreePhotoDrafts,
} = treePhotoSlice.actions;

export default treePhotoSlice.reducer;
