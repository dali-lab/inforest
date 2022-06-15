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
import { resetTreeCensusLabels } from "./treeCensusLabelSlice";

const BASE_URL = SERVER_URL + "sync";

const initialState = {};

export const uploadCensusData = createAsyncThunk(
  "sync/uploadCensusData",
  async (_params, thunkApi) => {
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
    } = thunkApi.getState() as RootState;
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
      .then(async (response) => response.data)
      .catch(() => {});
  }
);

export const loadForestData = createAsyncThunk(
  "sync/loadForestData",
  async (forestId: string, { dispatch }) => {
    dispatch(getForest({ id: forestId }));
    dispatch(getForestPlots({ forestId }));
    dispatch(getForestTrees({ forestId }));
    dispatch(getForestTreeCensuses({ forestId }));
    dispatch(getAllTreeSpecies());
    dispatch(getAllTreeLabels());
    dispatch(getAllTreePhotoPurposes());
    dispatch(getForestForestCensuses({ forestId }));
    dispatch(getPlotCensuses());
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
  },
  extraReducers: (builder) => {
    builder.addCase(uploadCensusData.fulfilled, () => {
      clearTreeDrafts();
      clearTreeCensusDrafts();
      clearTreePhotoDrafts();
    });
  },
});

export const { resetData } = syncSlice.actions;

export default syncSlice.reducer;
