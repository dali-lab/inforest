import { Tree, TreeCensus, TreePhoto } from "@ong-forestry/schema";
import { sequelize } from "index";
import {
  bulkUpsertTrees,
  bulkUpsertTreeCensuses,
  bulkInsertTreePhotos,
} from "services";

export interface SyncData {
  trees: Tree[];
  treeCensuses: TreeCensus[];
}

export const sync = async (data: SyncData) => {
  const transaction = await sequelize.transaction();
  try {
    const { trees, treeCensuses } = data;
    await bulkUpsertTrees(trees);
    await bulkUpsertTreeCensuses(treeCensuses);
    transaction.commit();
    return {};
  } catch (e: any) {
    transaction.rollback();
    console.error(e);
    return { error: e?.message ?? "An unknown error occured." };
  }
};
