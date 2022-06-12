import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TreeCensusLabel } from "@ong-forestry/schema";
import axios from "axios";
import { isArray } from "lodash";
import uuid from "uuid";
import SERVER_URL from "../../constants/Url";

const BASE_URL = SERVER_URL + "trees/censuses/labels";

type GetTreeCensusLabelsParams = {};

export const createTreeCensusLabel = createAsyncThunk(
  "treeCensusLabel/createTreeCensusLabel",
  async (newCensusLabel: Omit<TreeCensusLabel, "id">) => {
    return await axios
      .post(BASE_URL, newCensusLabel)
      .then((response) => response.data);
  }
);

export const deleteTreeCensusLabel = createAsyncThunk(
  "treeCensusLabel/deleteTreeCensusLabel",
  async (censusLabelId: string) => {
    return await axios
      .delete(`${BASE_URL}/${censusLabelId}`)
      .then((response) => response.data);
  }
);

export interface TreeCensusLabelState {
  all: Record<string, TreeCensusLabel>;
  indices: {
    byTreeCensus: Record<string, Set<string>>;
  };
  drafts: Set<string>;
  localDeletions: Set<string>;
}

const initialState: TreeCensusLabelState = {
  all: {},
  indices: {
    byTreeCensus: {},
  },
  drafts: new Set([]),
  localDeletions: new Set([]),
};

export const upsertTreeCensusLabels = (
  state: TreeCensusLabelState,
  action: any
) => {
  let newCensusLabels = [];
  if (action?.data) {
    newCensusLabels = action.data;
  } else newCensusLabels = action;
  if (!isArray(newCensusLabels)) newCensusLabels = [newCensusLabels];
  newCensusLabels.forEach((newCensusLabel, i) => {
    if (!newCensusLabel?.id) newCensusLabel.id = uuid.v4();
    state.all[newCensusLabel.id] = newCensusLabel;
    if (action?.draft) state.drafts.add(newCensusLabel.id);
    if (!(newCensusLabel.treeCensusId in state.indices.byTreeCensus))
      state.indices.byTreeCensus[newCensusLabel.treeCensusId] = new Set([]);
    state.indices.byTreeCensus[newCensusLabel.treeCensusId].add(
      newCensusLabel.id
    );
  });
  return state;
};

export const deleteTreeCensusLabels = (
  state: TreeCensusLabelState,
  ids: string[]
) => {
  for (const id of ids) {
    console.log(state.drafts);
    const currCensusLabel = state.all[id];
    state.drafts.delete(id);
    state.indices.byTreeCensus[currCensusLabel.treeCensusId].delete(id);
    delete state.all[id];
  }
  return state;
};

export const treeCensusLabelSlice = createSlice({
  name: "treeCensusLabel",
  initialState,
  reducers: {
    locallyCreateTreeCensusLabel: (state, action) => {
      return upsertTreeCensusLabels(state, {
        data: action.payload,
        draft: true,
      });
    },
    locallyDeleteTreeCensusLabel: (state, action: { payload: string }) => {
      state.localDeletions.add(action.payload);
      return deleteTreeCensusLabels(state, [action.payload]);
    },
    clearTreeCensusLabelDrafts: (state, action) => {
      return {
        ...state,
        drafts: initialState.drafts,
        localDeletions: initialState.localDeletions,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createTreeCensusLabel.fulfilled, (state, action) => {
      return upsertTreeCensusLabels(state, action.payload);
    });
    builder.addCase(deleteTreeCensusLabel.fulfilled, (state, action) => {
      return deleteTreeCensusLabels(state, [action.meta.arg]);
    });
  },
});

export const {
  locallyCreateTreeCensusLabel,
  locallyDeleteTreeCensusLabel,
  clearTreeCensusLabelDrafts,
} = treeCensusLabelSlice.actions;

export default treeCensusLabelSlice.reducer;
