import { TreePhoto } from "@ong-forestry/schema";
import TreePhotoModel from "db/models/tree-photo";
import { Op } from "sequelize";

export const createTreePhoto = async (treePhoto: TreePhoto) => {
  await TreePhotoModel.create(treePhoto);
};

export interface GetTreePhotosParams {
  id?: string;

  treeTag?: string;
  purposeName?: string;

  limit?: number;
  offset?: number;
}

export const getTreePhotos = async (params: GetTreePhotosParams) => {
  const { id, treeTag, purposeName, limit, offset } = params;
  const query: any = {
    where: {},
  };
  if (id) {
    query.where.id = {
      [Op.eq]: id,
    };
  }
  if (treeTag) {
    query.where.treeTag = {
      [Op.eq]: treeTag,
    };
  }
  if (purposeName) {
    query.where.purposeName = {
      [Op.eq]: purposeName,
    };
  }
  if (limit) {
    query.limit = limit;
  }
  if (offset) {
    query.offset = offset;
  }
  const treePhotos = await TreePhotoModel.findAll(query);
  return treePhotos;
};
