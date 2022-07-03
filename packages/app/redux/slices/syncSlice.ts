import {
  Tree,
  TreeCensus,
  TreeCensusLabel,
  TreePhoto,
} from "@ong-forestry/schema";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "..";
import SERVER_URL from "../../constants/Url";
import { clearTreeDrafts, getForestTrees, resetTrees } from "./treeSlice";
import {
  clearTreeCensusDrafts,
  getForestTreeCensuses,
  resetTreeCensuses,
} from "./treeCensusSlice";
import { clearTreePhotoDrafts, resetTreePhotos } from "./treePhotoSlice";
import {
  getForestForestCensuses,
  resetForestCensuses,
} from "./forestCensusSlice";
import { getForest, resetForests } from "./forestSlice";
import { getPlotCensuses, resetPlotCensuses } from "./plotCensusSlice";
import { getForestPlots, resetPlots } from "./plotSlice";
import { getAllTreeLabels, resetTreeLabels } from "./treeLabelSlice";
import {
  getAllTreePhotoPurposes,
  resetTreePhotoPurposes,
} from "./treePhotoPurposeSlice";
import { getAllTreeSpecies, resetTreeSpecies } from "./treeSpeciesSlice";
import {
  clearTreeCensusLabelDrafts,
  resetTreeCensusLabels,
} from "./treeCensusLabelSlice";

const BASE_URL = SERVER_URL + "sync";

export type SyncState = {
  loadingTasks: Set<string>;
};

const initialState: SyncState = {
  loadingTasks: new Set([]),
};

export const uploadCensusData = createAsyncThunk(
  "sync/uploadCensusData",
  async (_params, { getState, dispatch }) => {
    const loadMessage = "Uploading New Census Data...";
    dispatch(startLoading(loadMessage));
    const {
      trees: {
        all: allTrees,
        drafts: treeDrafts,
        localDeletions: deletedTrees,
      },
      treeCensuses: {
        all: allTreeCensuses,
        drafts: treeCensusDrafts,
        localDeletions: deletedTreeCensuses,
      },
      treePhotos: {
        all: allTreePhotos,
        drafts: treePhotoDrafts,
        localDeletions: deletedTreePhotos,
      },
      treeCensusLabels: {
        all: allTreeCensusLabels,
        drafts: treeCensusLabelDrafts,
        localDeletions: deletedTreeCensusLabels,
      },
    } = getState() as RootState;
    const trees: Tree[] = [];
    const treeCensuses: TreeCensus[] = [];
    const treePhotos: (TreePhoto & { buffer: string })[] = [];
    const treeCensusLabels: TreeCensusLabel[] = [];
    treeDrafts.forEach((treeId) => trees.push(allTrees[treeId]));
    treeCensusDrafts.forEach((treeCensusId) =>
      treeCensuses.push(allTreeCensuses[treeCensusId])
    );
    treePhotoDrafts.forEach((treePhotoId) =>
      treePhotos.push(
        allTreePhotos[treePhotoId] as TreePhoto & { buffer: string }
      )
    );
    treeCensusLabelDrafts.forEach((censusLabelId) => {
      treeCensusLabels.push(allTreeCensusLabels[censusLabelId]);
    });
    console.log(
      treeDrafts,
      treeCensusDrafts,
      treePhotoDrafts,
      treeCensusLabelDrafts
    );
    return await axios
      .post(BASE_URL, {
        upserted: { trees, treeCensuses, treePhotos, treeCensusLabels },
        deleted: {
          trees: Array.from(deletedTrees),
          treeCensuses: Array.from(deletedTreeCensuses),
          treePhotos: Array.from(deletedTreePhotos),
          treeCensusLabels: Array.from(deletedTreeCensusLabels),
        },
      })
      .then(async (response) => {
        dispatch(stopLoading(loadMessage));
        dispatch(clearTreeDrafts());
        dispatch(clearTreeCensusDrafts());
        dispatch(clearTreePhotoDrafts());
        dispatch(clearTreeCensusLabelDrafts());
        return response.data;
      })
      .catch((err: any) => {
        dispatch(stopLoading(loadMessage));
        dispatch(clearTreeDrafts());
        dispatch(clearTreeCensusDrafts());
        dispatch(clearTreePhotoDrafts());
        dispatch(clearTreeCensusLabelDrafts());

        alert(
          "An error occurred while syncing your data: " +
            err?.message +
            ". Ensure your connection is reliable and try again."
        );
        throw err;
      });
  }
);

export const loadForestData = createAsyncThunk(
  "sync/loadForestData",
  async (forestId: string, { dispatch }) => {
    const loadMessage = "Loading Census Data...";
    try {
      dispatch(startLoading(loadMessage));
      await dispatch(getForest({ id: forestId }));
      await dispatch(getForestPlots({ forestId }));
      await dispatch(getForestTrees({ forestId }));
      await dispatch(getForestTreeCensuses({ forestId }));
      await dispatch(getAllTreeSpecies());
      await dispatch(getAllTreeLabels());
      await dispatch(getAllTreePhotoPurposes());
      await dispatch(getForestForestCensuses({ forestId }));
      await dispatch(getPlotCensuses());
      dispatch(stopLoading(loadMessage));
    } catch (err: any) {
      console.error(err);
      alert("Error while loading census data: " + err?.message + ".");
      dispatch(stopLoading(loadMessage));
      throw err;
    }
  }
);

export const syncSlice = createSlice({
  name: "sync",
  initialState,
  reducers: {
    resetData: () => {
      resetForests();
      resetForestCensuses();
      resetPlots();
      resetPlotCensuses();
      resetTrees();
      resetTreeCensuses();
      resetTreeCensusLabels();
      resetTreeLabels();
      resetTreePhotoPurposes();
      resetTreePhotos();
      resetTreeSpecies();
    },
    startLoading: (
      state,
      action: { payload: string } = { payload: "Loading..." }
    ) => {
      state.loadingTasks.add(action.payload);
      return state;
    },
    stopLoading: (
      state,
      action: { payload: string } = { payload: "Loading..." }
    ) => {
      state.loadingTasks.delete(action.payload);
      return state;
    },
  },
});

export const { resetData, startLoading, stopLoading } = syncSlice.actions;

export default syncSlice.reducer;
