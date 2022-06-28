import {
  Tree,
  TreeCensus,
  TreeCensusLabel,
  TreePhoto,
} from "@ong-forestry/schema";
import { sequelize } from "index";
import {
  bulkUpsertTrees,
  bulkUpsertTreeCensuses,
  bulkInsertTreePhotos,
  deleteTreePhotos,
} from "services";
import {
  bulkInsertTreeCensusLabels,
  deleteTreeCensusLabels,
} from "./tree-census-label-service";
import { deleteTreeCensuses } from "./tree-census-service";
import { deleteTrees } from "./tree-service";

export interface SyncData {
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
}

export const sync = async (data: SyncData) => {
  const transaction = await sequelize.transaction();
  try {
    const { upserted, deleted } = data;

    await bulkUpsertTrees(upserted.trees);
    await deleteTrees({ ids: deleted.trees });

    await bulkUpsertTreeCensuses(upserted.treeCensuses);
    await deleteTreeCensuses({ ids: deleted.treeCensuses });

    await bulkInsertTreePhotos(upserted.treePhotos);
    await deleteTreePhotos({ ids: deleted.treePhotos });

    await bulkInsertTreeCensusLabels(upserted.treeCensusLabels);
    await deleteTreeCensusLabels({ ids: deleted.treeCensusLabels });

    transaction.commit();
    return {};
  } catch (e: any) {
    transaction.rollback();
    console.error(e);
    return { error: e?.message ?? "An unknown error occured." };
  }
};
