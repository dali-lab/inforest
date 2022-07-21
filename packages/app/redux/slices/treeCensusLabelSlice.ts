import { createSlice } from "@reduxjs/toolkit";
import { TreeCensusLabel } from "@ong-forestry/schema";
import axios from "axios";
import uuid from "uuid";
import SERVER_URL from "../../constants/Url";
import { UpsertAction, createAppAsyncThunk, throwIfLoadingBase } from "../util";
import { produce } from "immer";

const BASE_URL = SERVER_URL + "trees/censuses/labels";

const throwIfLoading = throwIfLoadingBase("treeCensusLabels");

export const createTreeCensusLabel = createAppAsyncThunk(
  "treeCensusLabel/createTreeCensusLabel",
  async (
    newCensusLabel: Omit<TreeCensusLabel, "id">,
    { dispatch, getState }
  ) => {
    throwIfLoading(getState());
    dispatch(startTreeCensusLabelLoading());
    return await axios
      .post(BASE_URL, newCensusLabel)
      .finally(() => dispatch(stopTreeCensusLabelLoading()))
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        alert("Error while adding label: " + err?.message);
        throw err;
      });
  }
);

export const deleteTreeCensusLabel = createAppAsyncThunk(
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
): TreeCensusLabelState => {
  const draftModels = action?.overwriteNonDrafts
    ? Object.values(state.all).filter((censusLabel) =>
        state.drafts.has(censusLabel.id)
      )
    : [];
  return produce(
    action?.overwriteNonDrafts
      ? upsertTreeCensusLabels(initialState, {
          data: draftModels,
          draft: true,
        })
      : state,
    (newState) => {
      const newCensusLabels = action.data;
      newCensusLabels.forEach((newCensusLabel) => {
        if (!newCensusLabel?.id) newCensusLabel.id = uuid.v4();
        newState.all[newCensusLabel.id] = newCensusLabel;
        if (action?.draft) newState.drafts.add(newCensusLabel.id);
        if (!(newCensusLabel.treeCensusId in newState.indices.byTreeCensus))
          newState.indices.byTreeCensus[newCensusLabel.treeCensusId] = new Set(
            []
          );
        newState.indices.byTreeCensus[newCensusLabel.treeCensusId].add(
          newCensusLabel.id
        );
      });
    }
  );
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
      return upsertTreeCensusLabels(state, {
        data: action.payload,
        overwriteNonDrafts: true,
      });
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
    clearTreeCensusLabelDrafts: (
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
