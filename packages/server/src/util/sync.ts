import { Tree, TreeCensus, TreePhoto } from "@ong-forestry/schema";
import { sequelize } from "index";
import {
  bulkUpsertTrees,
  bulkUpsertTreeCensuses,
  bulkUpsertTreePhotos,
} from "services";

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
