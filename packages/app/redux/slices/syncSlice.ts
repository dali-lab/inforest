import { Tree, TreeCensus, TreePhoto } from "@ong-forestry/schema";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "..";
import SERVER_URL from "../../constants/Url";
import { clearTreeDrafts } from "./treeSlice";
import { clearTreeCensusDrafts } from "./treeCensusSlice";
import { clearTreePhotoDrafts, uploadTreePhoto } from "./treePhotoSlice";

const BASE_URL = SERVER_URL + "sync";

const initialState = {};

export const uploadCensusData = createAsyncThunk(
  "sync/uploadCensusData",
  async (_params, thunkApi) => {
    const {
      trees: { all: allTrees, drafts: treeDrafts },
      treeCensuses: { all: allTreeCensuses, drafts: treeCensusDrafts },
      treePhotos: { all: allTreePhotos, drafts: treePhotoDrafts },
    } = thunkApi.getState() as RootState;
    const trees: Tree[] = [];
    const treeCensuses: TreeCensus[] = [];
    const treePhotos: (TreePhoto & { buffer: string })[] = [];
    treeDrafts.forEach((treeId) => trees.push(allTrees[treeId]));
    treeCensusDrafts.forEach((treeCensusId) =>
      treeCensuses.push(allTreeCensuses[treeCensusId])
    );
    treePhotoDrafts.forEach((treePhotoId) =>
      treePhotos.push(
        allTreePhotos[treePhotoId] as TreePhoto & { buffer: string }
      )
    );
    return await axios
      .post(BASE_URL, { trees, treeCensuses })
      .then(async (response) => {
        const uploadPhotos = treePhotos.map(async (photo) => {
          return thunkApi.dispatch(uploadTreePhoto(photo));
        });
        return await Promise.all(uploadPhotos);
      });
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
    });
  },
});

export default syncSlice.reducer;
