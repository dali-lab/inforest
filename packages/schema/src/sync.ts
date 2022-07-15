type SyncResponseObject = {
  added?: string[];
  deleted?: string[];
};

export type SyncResponse = {
  trees: SyncResponseObject;
  treeCensuses: SyncResponseObject;
  treePhotos: SyncResponseObject;
  treeCensusLabels: SyncResponseObject;
};
