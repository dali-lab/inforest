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
} from "services";

interface EditTreeData {
  data: Partial<Tree>;
  query: GetTreesParams;
}
interface EditTreeCensusData {
  data: Partial<TreeCensus>;
  query: TreeCensusParams;
}
interface EditTreePhotoData {
  data: Partial<TreePhoto>;
  query: GetTreePhotosParams;
}

export interface SyncData {
  trees: { new: Tree[]; edited: EditTreeData[] };
  treeCensuses: { new: TreeCensus[]; edited: EditTreeCensusData[] };
  treePhotos: { new: TreePhoto[]; edited: EditTreePhotoData[] };
}

export const sync = async (data: SyncData) => {
  const transaction = await sequelize.transaction();
  try {
    var result = {
      trees: new Array<Tree>(),
      treeCensuses: new Array<TreeCensus>(),
      treePhotos: new Array<TreePhoto>(),
    };

    // create new trees
    if (data.trees.new != [])
      result.trees.concat(
        await Promise.all(data.trees.new.map((tree) => createTree(tree)))
      );
    // edit trees
    if (data.trees.edited != [])
      result.trees.concat(
        ...(await Promise.all(
          data.trees.edited.map((edit) => editTrees(edit.data, edit.query))
        ))
      );

    // create new tree censuses
    if (data.treeCensuses.new != [])
      result.treeCensuses.concat(
        await Promise.all(
          data.treeCensuses.new.map((treeCensus) =>
            createTreeCensus(treeCensus)
          )
        )
      );
    // edit tree censuses
    if (data.treeCensuses.edited != [])
      result.treeCensuses.concat(
        ...(await Promise.all(
          data.treeCensuses.edited.map((edit) =>
            editTreeCensuses(edit.data, edit.query)
          )
        ))
      );

    // create new tree photos
    if (data.treePhotos.new != [])
      result.treePhotos.concat(
        await Promise.all(
          data.treePhotos.new.map((treePhoto) => createTreePhoto(treePhoto))
        )
      );
    // edit tree photos
    if (data.treePhotos.edited != [])
      result.treePhotos.concat(
        ...(await Promise.all(
          data.treePhotos.edited.map((edit) =>
            editTreePhotos(edit.data, edit.query)
          )
        ))
      );

    transaction.commit();
    return { data: result };
  } catch (e: any) {
    transaction.rollback();
    console.log(e);
    return { error: e?.message ?? "An unknown error occured." };
  }
};
