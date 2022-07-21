import { Tree, TreePhoto, TreeCensusLabel } from "tree";
import { TreeCensus } from "tree-census";

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

export type SyncData = {
  upserted: {
    trees: Tree[];
    treeCensuses: TreeCensus[];
    treePhotos: TreePhoto[];
    treeCensusLabels: TreeCensusLabel[];
  };
  deleted: {
    trees: string[];
    treeCensuses: string[];
    treePhotos: string[];
    treeCensusLabels: string[];
  };
};
