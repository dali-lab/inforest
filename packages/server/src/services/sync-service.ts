import {
  SyncResponse,
  Tree,
  TreeCensus,
  TreeCensusLabel,
  TreePhoto,
  SyncData,
} from "@ong-forestry/schema";
import { sequelize } from "index";
import {
  bulkUpsertTrees,
  bulkUpsertTreeCensuses,
  bulkInsertTreePhotos,
  bulkInsertTreeCensusLabels,
  bulkDeleteTreePhotos,
  bulkDeleteTreeCensuses,
  bulkDeleteTrees,
  bulkDeleteTreeCensusLabels,
} from "services";
import util from "util";

export const sync = async (data: SyncData) => {
  const transaction = await sequelize.transaction();
  try {
    const { upserted, deleted } = data;
    const result: SyncResponse = {
      trees: {},
      treeCensuses: {},
      treePhotos: {},
      treeCensusLabels: {},
    };
    result.trees.added = await bulkUpsertTrees(upserted.trees);
    result.trees.deleted = await bulkDeleteTrees(deleted.trees);

    result.treeCensuses.added = await bulkUpsertTreeCensuses(
      upserted.treeCensuses
    );
    result.treeCensuses.deleted = await bulkDeleteTreeCensuses(
      deleted.treeCensuses
    );

    result.treePhotos.added = await bulkInsertTreePhotos(upserted.treePhotos);
    result.treePhotos.deleted = await bulkDeleteTreePhotos(deleted.treePhotos);

    result.treeCensusLabels.added = await bulkInsertTreeCensusLabels(
      upserted.treeCensusLabels
    );
    result.treeCensusLabels.deleted = await bulkDeleteTreeCensusLabels(
      deleted.treeCensusLabels
    );

    transaction.commit();
    console.log("sync result", util.inspect(result, { depth: 5 }));
    return result;
  } catch (e: any) {
    transaction.rollback();
    console.error(e);
    return { error: e?.message ?? "An unknown error occured." };
  }
};
