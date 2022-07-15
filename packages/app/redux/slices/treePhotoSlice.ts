import { TreePhoto } from "@ong-forestry/schema";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import uuid from "uuid";
import axios from "axios";
import SERVER_URL from "../../constants/Url";
import { RootState, UpsertAction } from "..";
import { cloneDeep } from "lodash";

const BASE_URL = SERVER_URL + "trees/photos";

export interface TreePhotoState {
  all: Record<string, TreePhoto & { buffer?: string }>;
  indices: {
    byTreeCensus: Record<string, Set<string>>;
  };
  drafts: Set<string>;
  localDeletions: Set<string>;
  loading: boolean;
}

const initialState: TreePhotoState = {
  all: {},
  indices: {
    byTreeCensus: {},
  },
  drafts: new Set([]),
  localDeletions: new Set([]),
  loading: false,
};

export const createTreePhoto = createAsyncThunk(
  "treePhoto/createTreePhoto",
  async (
    newPhoto: Omit<TreePhoto, "id"> & { buffer: string },
    { dispatch }
  ) => {
    dispatch(startTreePhotoLoading());
    return await axios
      .post(BASE_URL, newPhoto)
      .then((response) => {
        dispatch(stopTreePhotoLoading());
        return response.data;
      })
      .catch((err) => {
        dispatch(stopTreePhotoLoading());
        alert("Error while uploading tree photo: " + err?.message);
        throw err;
      });
  }
);

export const updateTreePhoto = createAsyncThunk(
  "treePhoto/updateTreePhoto",
  async (updatedPhoto: TreePhoto, { getState, dispatch }) => {
    const oldPhoto = (getState() as RootState).treePhotos.all[updatedPhoto.id];
    dispatch(locallyUpdateTreePhoto(updatedPhoto));
    const { id, ...updates } = updatedPhoto;
    return await axios
      .patch(`${BASE_URL}/${id}`, updates)
      .then((response) => {
        // dispatch(clearTreePhotoDrafts());
        return response.data;
      })
      .catch((err) => {
        dispatch(locallyUpdateTreePhoto(oldPhoto));
        // dispatch(clearTreePhotoDrafts());
        alert("Error while updating tree photo: " + err?.message);
        throw err;
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

export const upsertTreePhotos = (
  state: TreePhotoState,
  action: UpsertAction<TreePhoto>
) => {
  if (action?.overwriteNonDrafts) {
    const newState = cloneDeep(initialState);
    const draftModels = Object.values(state.all).filter((treePhoto) =>
      state.drafts.has(treePhoto.id)
    );
    state = upsertTreePhotos(newState, { data: draftModels, draft: true });
  }
  const newPhotos: TreePhoto[] = action.data;
  newPhotos.forEach((newPhoto) => {
    if (!newPhoto?.id) newPhoto.id = uuid.v4();
    // add to drafts
    state.all[newPhoto.id] = newPhoto;
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
    addTreePhotos: (state, action: { payload: TreePhoto[] }) => {
      return upsertTreePhotos(state, {
        data: action.payload,
        overwriteNonDrafts: true,
      });
    },
    locallyCreateTreePhoto: (state, action) => {
      return upsertTreePhotos(state, { data: [action.payload], draft: true });
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
    clearTreePhotoDrafts: (
      state,
      action: { payload: { added?: string[]; deleted?: string[] } }
    ) => {
      for (const id of action?.payload?.added || []) {
        state.drafts.delete(id);
      }
      for (const id of action?.payload?.deleted || []) {
        state.localDeletions.delete(id);
      }
      return state;
    },
    resetTreePhotos: () => initialState,
    startTreePhotoLoading: (state) => ({ ...state, loading: true }),
    stopTreePhotoLoading: (state) => ({ ...state, loading: false }),
  },
  extraReducers: (builder) => {
    builder.addCase(
      createTreePhoto.fulfilled,
      (state, action: { payload: TreePhoto }) => {
        return upsertTreePhotos(state, { data: [action.payload] });
      }
    );
    builder.addCase(
      updateTreePhoto.fulfilled,
      (state, action: { payload: TreePhoto }) => {
        return upsertTreePhotos(state, { data: [action.payload] });
      }
    );
    builder.addCase(deleteTreePhoto.fulfilled, (state, action) => {
      return deleteTreePhotos(state, [action.meta.arg]);
    });
  },
});

export const {
  addTreePhotos,
  locallyCreateTreePhoto,
  locallyDeleteTreePhoto,
  locallyUpdateTreePhoto,
  clearTreePhotoDrafts,
  resetTreePhotos,
  startTreePhotoLoading,
  stopTreePhotoLoading,
} = treePhotoSlice.actions;

export default treePhotoSlice.reducer;
