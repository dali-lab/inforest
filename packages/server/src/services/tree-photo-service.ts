import { TreePhoto } from "@ong-forestry/schema";
import TreePhotoModel from "db/models/tree-photo";
import { Op } from "sequelize";
import { uploadImage } from "util/s3";

export const createTreePhoto = async ({ body: treePhoto, images }: any) => {
  if (images.length != 0) throw new Error("Invalid number of images uploaded");
  const image = images[0];
  treePhoto.fullUrl = await uploadImage(image.full);
  treePhoto.thumbUrl = await uploadImage(image.thumb);
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
  if (limit) {
    query.limit = limit;
  }
  if (offset) {
    query.offset = offset;
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
