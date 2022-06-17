import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TreeCensus, TreeCensusLabel, TreePhoto } from "@ong-forestry/schema";
import SERVER_URL from "../../constants/Url";
import axios from "axios";
import uuid from "react-native-uuid";
import { RootState, UpsertAction } from "..";
import { addTreePhotos } from "./treePhotoSlice";
import { addTreeCensusLabels } from "./treeCensusLabelSlice";

const BASE_URL = SERVER_URL + "trees/censuses";

type GetPlotCensusTreeCensusesParams = {
  plotCensusId: string;
};

type GetForestTreeCensusesParams = {
  forestId: string;
};

export const populateTreeCensusModels = createAsyncThunk(
  "treeCensus/populateTreeCensusModels",
  async (censuses: TreeCensus[], thunkApi) => {
    const newCensuses: TreeCensus[] = [];
    let newCensusLabels: TreeCensusLabel[] = [];
    let newPhotos: TreePhoto[] = [];
    censuses.forEach((census) => {
      const { labels, photos, ...censusData } = census;
      newCensuses.push(censusData);
      newCensusLabels = newCensusLabels.concat(
        //@ts-ignore
        labels?.map((label) => label?.TreeCensusLabel) || []
      );
      newPhotos = newPhotos.concat(photos || []);
    });
    // this is O(4n) which we don't like since ideally we just loop thru it once
    // we have to do this because we don't have direct access to the treeCensusLabel and treePhoto states in this slice
    // possible slice restructuring could solve this inefficiency
    await thunkApi.dispatch(addTreeCensuses(newCensuses));
    await thunkApi.dispatch(addTreeCensusLabels(newCensusLabels));
    await thunkApi.dispatch(addTreePhotos(newPhotos));
  }
);

export const getPlotCensusTreeCensuses = createAsyncThunk(
  "treeCensus/getPlotCensusTreeCensuses",
  async (params: GetPlotCensusTreeCensusesParams, { dispatch }) => {
    return await axios
      .get<TreeCensus[]>(`${BASE_URL}?plotCensusId=${params.plotCensusId}`)
      .then((response) => {
        dispatch(populateTreeCensusModels(response.data));
      });
  }
);

export const getForestTreeCensuses = createAsyncThunk(
  "treeCensus/getForestTreeCensuses",
  async (params: GetForestTreeCensusesParams, { dispatch }) => {
    return await axios
      .get<TreeCensus[]>(`${BASE_URL}?forestId=${params.forestId}`)
      .then((response) => {
        dispatch(populateTreeCensusModels(response.data));
      });
  }
);

export const createTreeCensus = createAsyncThunk(
  "treeCensus/createTreeCensus",
  async (newCensus: Partial<TreeCensus>) => {
    return await axios
      .post(`${BASE_URL}`, newCensus)
      .then((response) => response.data)
      .catch((err) => {
        alert("Error while uploading tree census data: " + err?.message);
        throw err;
      });
  }
);

export const updateTreeCensus = createAsyncThunk(
  "treeCensus/updateTreeCensus",
  async (updatedCensus: TreeCensus, { getState, dispatch }) => {
    const oldCensus = (getState() as RootState)?.trees.all[updatedCensus.id];
    dispatch(locallyUpdateTreeCensus(updatedCensus));
    const { id, ...updates } = updatedCensus;
    return await axios
      .patch(`${BASE_URL}/${id}`, updates)
      .then((response) => {
        dispatch(clearTreeCensusDrafts());
        return response.data;
      })
      .catch((err) => {
        dispatch(locallyUpdateTreeCensus(oldCensus));
        dispatch(clearTreeCensusDrafts());
        alert("Error while updating tree census: " + err?.message);
        throw err;
      });
  }
);

export const deleteTreeCensus = createAsyncThunk(
  "treeCensus/deleteTreeCensus",
  async (id: string) => {
    return await axios
      .delete(`${BASE_URL}/${id}`)
      .then((response) => response.data);
  }
);

// takes the state and the action payload(!!) and returns the updated state with the payload's censuses added. used for downloading, drafting, and rehydrating
export const upsertTreeCensuses = (
  state: TreeCensusState,
  action: UpsertAction<TreeCensus>
) => {
  const newCensuses: TreeCensus[] = action.data;
  newCensuses.forEach((newCensus) => {
    if (!newCensus?.id) newCensus.id = uuid.v4().toString();
    state.all[newCensus.id] = newCensus;
    // add to drafts
    if (action?.draft) state.drafts.add(newCensus.id);
    if (!(newCensus.plotCensusId in state.indices.byPlotCensus))
      state.indices.byPlotCensus[newCensus.plotCensusId] = new Set([]);
    state.indices.byPlotCensus[newCensus.plotCensusId].add(newCensus.id);
    if (!(newCensus.treeId in state.indices.byTree))
      state.indices.byTree[newCensus.treeId] = new Set([]);
    state.indices.byTree[newCensus.treeId].add(newCensus.id);
    state.indices.byTreeActive[newCensus.treeId] = newCensus.id;
    if (action?.selectFinal) state.selected = newCensus.id;
  });

  return state;
};

export const deleteTreeCensuses = (state: TreeCensusState, ids: string[]) => {
  for (const id of ids) {
    const currCensus = state.all[id];
    state.indices.byPlotCensus[currCensus.plotCensusId].delete(id);
    state.indices.byTree[currCensus.treeId].delete(id);
    delete state.indices.byTreeActive[currCensus.treeId];
    if (id === state.selected) state.selected = undefined;
    delete state.all[id];
  }
  return state;
};

export interface TreeCensusState {
  all: Record<string, TreeCensus>;
  indices: {
    byPlotCensus: Record<string, Set<string>>;
    byTree: Record<string, Set<string>>;
    byTreeActive: Record<string, string>;
  };
  drafts: Set<string>;
  localDeletions: Set<string>;
  selected: string | undefined;
}

const initialState: TreeCensusState = {
  all: {},
  indices: {
    byPlotCensus: {},
    byTree: {},
    byTreeActive: {},
  },
  drafts: new Set([]),
  localDeletions: new Set([]),
  selected: undefined,
};

export const treeCensusSlice = createSlice({
  name: "treeCensus",
  initialState,
  reducers: {
    addTreeCensuses: (state, action: { payload: TreeCensus[] }) => {
      return upsertTreeCensuses(state, { data: action.payload });
    },
    locallyCreateTreeCensus: (state, action) => {
      return upsertTreeCensuses(state, {
        data: [action.payload],
        draft: true,
        selectFinal: true,
      });
    },
    locallyDeleteTreeCensus: (state, action: { payload: string }) => {
      state.localDeletions.add(action.payload);
      return deleteTreeCensuses(state, [action.payload]);
    },
    locallyUpdateTreeCensus: (state, action) => {
      const updated = action.payload;
      state.all[updated.id] = updated;
      return state;
    },
    selectTreeCensus: (state, action) => {
      state.selected = action.payload;
      return state;
    },
    deselectTreeCensus: (state) => {
      state.selected = undefined;
      return state;
    },
    clearTreeCensusDrafts: (state) => {
      return {
        ...state,
        drafts: initialState.drafts,
        localDeletions: initialState.localDeletions,
      };
    },
    resetTreeCensuses: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getPlotCensusTreeCensuses.fulfilled, (state, action) => {
      return action.payload;
    });
    builder.addCase(
      createTreeCensus.fulfilled,
      (state, action: { payload: TreeCensus }) => {
        return upsertTreeCensuses(state, {
          data: [action.payload],
          selectFinal: true,
        });
      }
    );
    // builder.addCase(
    //   createTreeCensus.rejected,
    //   (state, action: { payload: any }) => {
    //     console.error(action);
    //     alert("Tree census creation failed.");
    //   }
    // );
    builder.addCase(
      updateTreeCensus.fulfilled,
      (state, action: { payload: TreeCensus }) => {
        return upsertTreeCensuses(state, { data: [action.payload] });
      }
    );
    builder.addCase(deleteTreeCensus.fulfilled, (state, action) => {
      if (action.meta.arg === state.selected) state.selected = undefined;
      return deleteTreeCensuses(state, [action.meta.arg]);
    });
  },
});

export const {
  addTreeCensuses,
  locallyCreateTreeCensus,
  locallyDeleteTreeCensus,
  locallyUpdateTreeCensus,
  selectTreeCensus,
  deselectTreeCensus,
  clearTreeCensusDrafts,
  resetTreeCensuses,
} = treeCensusSlice.actions;

export default treeCensusSlice.reducer;
