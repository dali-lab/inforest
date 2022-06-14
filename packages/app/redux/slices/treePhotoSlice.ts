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
  localDeletions: Set<string>;
}

const initialState: TreePhotoState = {
  all: {},
  indices: {
    byTreeCensus: {},
  },
  drafts: new Set([]),
  localDeletions: new Set([]),
};

export const createTreePhoto = createAsyncThunk(
  "treePhoto/createTreePhoto",
  async (params: Omit<TreePhoto, "id"> & { buffer: string }, thunkApi) => {
    return await axios.post(BASE_URL, params, {}).then((response) => {
      return response.data;
    });
  }
);

export const updateTreePhoto = createAsyncThunk(
  "treePhoto/updateTreePhoto",
  async (photoUpdates: TreePhoto) => {
    const { id, ...updates } = photoUpdates;
    return await axios.patch(`${BASE_URL}/${id}`, updates).then((response) => {
      return response.data;
    });
  }
);

export const deleteTreePhoto = createAsyncThunk(
  "treePhoto/deleteTreePhoto",
  async (id: string) => {
    return await axios.delete(`${BASE_URL}/${id}`).then((response) => {
      return response.data;
    });
  }
);

export const upsertTreePhotos = (state: TreePhotoState, action: any) => {
  let newPhotos: TreePhoto[];
  if (action?.draft) {
    newPhotos = action.data;
  } else newPhotos = action;
  if (!isArray(newPhotos)) newPhotos = [newPhotos];
  newPhotos.forEach((newPhoto) => {
    if (!newPhoto?.id) newPhoto.id = uuid.v4();
    if (!action?.rehydrate) state.all[newPhoto.id] = newPhoto;
    // add to drafts
    if (action?.draft) state.drafts.add(newPhoto.id);
    if (!(newPhoto.treeCensusId in state.indices.byTreeCensus))
      state.indices.byTreeCensus[newPhoto.treeCensusId] = new Set([]);

    state.indices.byTreeCensus[newPhoto.treeCensusId].add(newPhoto.id);
  });
  return state;
};

export const deleteTreePhotos = (state: TreePhotoState, ids: string[]) => {
  for (const id of ids) {
    const currPhoto = state.all[id];
    state.drafts.delete(id);
    state.indices.byTreeCensus[currPhoto.treeCensusId].delete(id);
    delete state.all[id];
  }
  return state;
};

export const treePhotoSlice = createSlice({
  name: "treePhoto",
  initialState,
  reducers: {
    locallyCreateTreePhoto: (state, action) => {
      return upsertTreePhotos(state, { data: action.payload, draft: true });
    },
    locallyDeleteTreePhoto: (state, action: { payload: string }) => {
      state.localDeletions.add(action.payload);
      return deleteTreePhotos(state, [action.payload]);
    },
    locallyUpdateTreePhoto: (state, action) => {
      const updated = action.payload;
      state.all[updated.id] = updated;
      return state;
    },
    clearTreePhotoDrafts: (state) => {
      return {
        ...state,
        drafts: initialState.drafts,
        localDeletions: initialState.localDeletions,
      };
    },
    resetTreePhotos: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(createTreePhoto.fulfilled, (state, action: any) => {
      return upsertTreePhotos(state, action.payload);
    });
    builder.addCase(updateTreePhoto.fulfilled, (state, action) => {
      return upsertTreePhotos(state, action.payload);
    });
    builder.addCase(deleteTreePhoto.fulfilled, (state, action) => {
      return deleteTreePhotos(state, [action.meta.arg]);
    });
  },
});

export const {
  locallyCreateTreePhoto,
  locallyDeleteTreePhoto,
  locallyUpdateTreePhoto,
  clearTreePhotoDrafts,
  resetTreePhotos,
} = treePhotoSlice.actions;

export default treePhotoSlice.reducer;
