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
import { clearTreeDrafts } from "./treeSlice";
import { clearTreeCensusDrafts } from "./treeCensusSlice";
import { clearTreePhotoDrafts } from "./treePhotoSlice";

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

export const syncSlice = createSlice({
  name: "sync",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(uploadCensusData.fulfilled, (state, action) => {
      clearTreeDrafts();
      clearTreeCensusDrafts();
      clearTreePhotoDrafts();
    });
  },
});

export default syncSlice.reducer;
