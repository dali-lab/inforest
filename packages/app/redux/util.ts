import {
  AsyncThunkPayloadCreator,
  AsyncThunkOptions,
  AsyncThunk,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import {
  UserState,
  ForestState,
  PlotState,
  TreeState,
  TreeLabelState,
  TreeSpeciesState,
  TreePhotoState,
  TeamState,
  TreePhotoPurposeState,
  ForestCensusState,
  PlotCensusState,
  TreeCensusState,
  TreeCensusLabelState,
  SyncState,
} from "./slices";

export type RootState = {
  user: UserState;
  forest: ForestState;
  plots: PlotState;
  trees: TreeState;
  treeLabels: TreeLabelState;
  treeSpecies: TreeSpeciesState;
  treePhotos: TreePhotoState;
  teams: TeamState;
  treePhotoPurposes: TreePhotoPurposeState;
  forestCensuses: ForestCensusState;
  plotCensuses: PlotCensusState;
  treeCensuses: TreeCensusState;
  treeCensusLabels: TreeCensusLabelState;
  sync: SyncState;
};

export const throwIfLoadingBase =
  (key: keyof RootState) => (state: RootState) =>
    throwIfLoadingCore(key, state);

const throwIfLoadingCore = (key: keyof RootState, state: RootState) => {
  if (!("loading" in state?.[key]))
    throw new Error(`No 'loading' variable in ${key}.`);
  // @ts-ignore
  else if (state[key]?.loading)
    throw new Error(`${key} is loading, cannot send duplicate request.`);
};

type TypedcreateAppAsyncThunk<ThunkApiConfig> = <Returned, ThunkArg = void>(
  typePrefix: string,
  payloadCreator: AsyncThunkPayloadCreator<Returned, ThunkArg, ThunkApiConfig>,
  options?: AsyncThunkOptions<ThunkArg, ThunkApiConfig>
) => AsyncThunk<Returned, ThunkArg, ThunkApiConfig>;

export const createAppAsyncThunk: TypedcreateAppAsyncThunk<{
  state: RootState;
}> = createAsyncThunk;

export type UpsertAction<Model> = {
  data: Model[];
  // this flag is true if the added model(s) are drafts
  draft?: boolean;
  // this flag is true if the last model to be added should be selected
  selectFinal?: boolean;
  // this flag is true if the models should be upserted into a fresh state, with only drafts retained
  overwriteNonDrafts?: boolean;
};
