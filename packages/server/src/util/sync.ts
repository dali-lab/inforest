import { Tree, TreeCensus, TreePhoto } from "@ong-forestry/schema";
import { sequelize } from "index";
import {
  bulkUpsertTrees,
  bulkUpsertTreeCensuses,
  bulkUpsertTreePhotos,
} from "services";

interface TreeSyncData extends Partial<Tree> {
  id: string; // id is mandatory, everything else is optional
}
interface TreeCensusSyncData extends Partial<TreeCensus> {
  id: string;
}
interface TreePhotoSyncData extends Partial<TreePhoto> {
  id: string;
}

export interface SyncData {
  trees: TreeSyncData[];
  treeCensuses: TreeCensusSyncData[];
  treePhotos: TreePhotoSyncData[];
}

export const sync = async (data: SyncData) => {
  const transaction = await sequelize.transaction();
  try {
    var result = {
      trees: new Array<Tree>(),
      treeCensuses: new Array<TreeCensus>(),
      treePhotos: new Array<TreePhoto>(),
    };

    // validate: loop over everything and call checking functions

    // upsert trees
    if (data.trees != [])
      result.trees.concat(await bulkUpsertTrees(data.trees));

    // upsert tree censuses
    if (data.treeCensuses != [])
      result.treeCensuses.concat(
        await bulkUpsertTreeCensuses(data.treeCensuses)
      );
    // upsert photos
    if (data.treePhotos != [])
      result.treePhotos.concat(await bulkUpsertTreePhotos(data.treePhotos));

    transaction.commit();
    return { data: result };
  } catch (e: any) {
    transaction.rollback();
    console.log(e);
    return { error: e?.message ?? "An unknown error occured." };
  }
};
