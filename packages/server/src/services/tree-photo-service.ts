import { TreePhoto } from "@ong-forestry/schema";
import TreePhotoModel from "db/models/tree-photo";
import { Op } from "sequelize";

export const createTreePhoto = async (treePhoto: TreePhoto) => {
  return await TreePhotoModel.create(treePhoto);
};

export interface GetTreePhotosParams {
  id?: string;

  treeId?: string;
  purposeName?: string;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: GetTreePhotosParams) => {
  const { id, treeId, purposeName, limit, offset } = params;
  const query: any = {
    where: {},
    limit,
    offset,
  };
  if (id) {
    query.where.id = {
      [Op.eq]: id,
    };
  }
  if (treeId) {
    query.where.treeId = {
      [Op.eq]: treeId,
    };
  }
  if (purposeName) {
    query.where.purposeName = {
      [Op.eq]: purposeName,
    };
  }
  return query;
};

export const editTreePhotos = async (
  treePhoto: Partial<TreePhoto>,
  params: GetTreePhotosParams
) => {
  const query = constructQuery(params);
  return await TreePhotoModel.update(treePhoto, query);
};

export const getTreePhotos = async (params: GetTreePhotosParams) => {
  const query = constructQuery(params);
  return await TreePhotoModel.findAll(query);
};

export const deleteTreePhotos = async (params: GetTreePhotosParams) => {
  const query = constructQuery(params);
  return await TreePhotoModel.destroy(query);
};
