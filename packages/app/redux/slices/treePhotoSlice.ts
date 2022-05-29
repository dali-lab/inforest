import { TreePhoto } from "@ong-forestry/schema";
import { createSlice } from "@reduxjs/toolkit";
import { isArray } from "lodash";
import uuid from "uuid";

export interface TreePhotoState {
  all: Record<string, TreePhoto>;
  indices: {
    byTreeCensuses: Record<string, Set<string>>;
  };
  drafts: Set<string>;
}

const initialState: TreePhotoState = {
  all: {},
  indices: {
    byTreeCensuses: {},
  },
  drafts: new Set(),
};

const addTreePhotos = (state: TreePhotoState, action: any) => {
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
      !(newPhoto.treeCensusId in state.indices.byTreeCensuses) ||
      !state.indices.byTreeCensuses[newPhoto.treeCensusId]?.add
    ) {
      state.indices.byTreeCensuses[newPhoto.treeCensusId] = new Set();
    }
    state.indices.byTreeCensuses[newPhoto.treeCensusId].add(newPhoto.id);
  });
  return state;
};

export const treePhotoSlice = createSlice({
  name: "treePhoto",
  initialState,
  reducers: {
    createTreePhoto: (state, action) => {
      return addTreePhotos(state, action.payload);
    },
    locallyDraftNewPhoto: (state, action) => {
      return addTreePhotos(state, { data: action.payload, draft: true });
    },
    clearTreePhotoDrafts: (state) => {
      return { ...state, drafts: initialState.drafts };
    },
  },
});

export const { createTreePhoto, locallyDraftNewPhoto, clearTreePhotoDrafts } =
  treePhotoSlice.actions;

export default treePhotoSlice.reducer;
