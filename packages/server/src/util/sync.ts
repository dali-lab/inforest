import { Tree, TreeCensus, TreePhoto } from "@ong-forestry/schema";
import { sequelize } from "index";
import {
  createTree,
  createTreeCensus,
  TreeCensusParams,
  editTrees,
  GetTreePhotosParams,
  GetTreesParams,
  editTreeCensuses,
  createTreePhoto,
  editTreePhotos,
  bulkUpsertTrees,
  bulkUpsertTreeCensuses,
  bulkUpsertTreePhotos,
} from "services";

interface EditTreeData {
  data: Partial<Tree>;
  query: GetTreesParams;
}
interface EditTreeCensusData {
  data: Omit<TreeCensus, "plotCensusId">;
  query: TreeCensusParams;
}
interface EditTreePhotoData {
  data: Partial<TreePhoto>;
  query: GetTreePhotosParams;
}

export interface SyncData {
  trees: Tree[];
  treeCensuses: TreeCensus[];
  treePhotos: TreePhoto[];
}

export const sync = async (data: SyncData) => {
  const transaction = await sequelize.transaction();
  try {
    const { trees, treeCensuses, treePhotos } = data;
    console.log(trees, treeCensuses, treePhotos);
    console.log("treeUpsert", await bulkUpsertTrees(trees));
    console.log("treeCensusUpsert", await bulkUpsertTreeCensuses(treeCensuses));
    console.log("treePhotoUpsert", await bulkUpsertTreePhotos(treePhotos));
    transaction.commit();
    return {};
  } catch (e: any) {
    transaction.rollback();
    console.error(e);
    return { error: e?.message ?? "An unknown error occured." };
  }
};
