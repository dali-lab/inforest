import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TreeCensusLabel } from "@ong-forestry/schema";
import axios from "axios";
import uuid from "uuid";
import SERVER_URL from "../../constants/Url";
import { UpsertAction } from "..";

const BASE_URL = SERVER_URL + "trees/censuses/labels";

export const createTreeCensusLabel = createAsyncThunk(
  "treeCensusLabel/createTreeCensusLabel",
  async (newCensusLabel: Omit<TreeCensusLabel, "id">, { dispatch }) => {
    dispatch(startTreeCensusLabelLoading());
    return await axios
      .post(BASE_URL, newCensusLabel)
      .then((response) => {
        dispatch(stopTreeCensusLabelLoading());
        return response.data;
      })
      .catch((err) => {
        dispatch(stopTreeCensusLabelLoading());
        alert("Error while adding label: " + err?.message);
        throw err;
      });
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
  loading: boolean;
}

const initialState: TreeCensusLabelState = {
  all: {},
  indices: {
    byTreeCensus: {},
  },
  drafts: new Set([]),
  localDeletions: new Set([]),
  loading: false,
};

export const upsertTreeCensusLabels = (
  state: TreeCensusLabelState,
  action: UpsertAction<TreeCensusLabel>
) => {
  const newCensusLabels = action.data;
  newCensusLabels.forEach((newCensusLabel) => {
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
    addTreeCensusLabels: (state, action: { payload: TreeCensusLabel[] }) => {
      return upsertTreeCensusLabels(state, { data: action.payload });
    },
    locallyCreateTreeCensusLabel: (state, action) => {
      return upsertTreeCensusLabels(state, {
        data: [action.payload],
        draft: true,
      });
    },
    locallyDeleteTreeCensusLabel: (state, action: { payload: string }) => {
      state.localDeletions.add(action.payload);
      return deleteTreeCensusLabels(state, [action.payload]);
    },
    clearTreeCensusLabelDrafts: (state) => {
      return {
        ...state,
        drafts: initialState.drafts,
        localDeletions: initialState.localDeletions,
      };
    },
    resetTreeCensusLabels: () => initialState,
    startTreeCensusLabelLoading: (state) => ({ ...state, loading: true }),
    stopTreeCensusLabelLoading: (state) => ({ ...state, loading: false }),
  },
  extraReducers: (builder) => {
    builder.addCase(
      createTreeCensusLabel.fulfilled,
      (state, action: { payload: TreeCensusLabel }) => {
        return upsertTreeCensusLabels(state, { data: [action.payload] });
      }
    );
    builder.addCase(deleteTreeCensusLabel.fulfilled, (state, action) => {
      return deleteTreeCensusLabels(state, [action.meta.arg]);
    });
  },
});

export const {
  addTreeCensusLabels,
  locallyCreateTreeCensusLabel,
  locallyDeleteTreeCensusLabel,
  clearTreeCensusLabelDrafts,
  resetTreeCensusLabels,
  startTreeCensusLabelLoading,
  stopTreeCensusLabelLoading,
} = treeCensusLabelSlice.actions;

export default treeCensusLabelSlice.reducer;
