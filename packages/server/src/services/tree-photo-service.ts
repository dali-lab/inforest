import { TreePhoto } from "@ong-forestry/schema";
import TreePhotoModel from "db/models/tree-photo";
import { Op } from "sequelize";
import { resizeImage } from "util/resize";
import { uploadImage } from "util/s3";

export const bulkInsertTreePhotos = async (
  treePhotos: (TreePhoto & { buffer?: string })[]
) => {
  treePhotos.map(async (photo) => {
    if (!photo?.buffer) {
      console.error("An uploaded image has no buffer!");
      return;
    }
    const resizedPhoto = await resizeImage(Buffer.from(photo.buffer, "base64"));
    photo.fullUrl = await uploadImage(resizedPhoto.full);
    photo.thumbUrl = await uploadImage(resizedPhoto.thumb);
    delete photo.buffer;
  });
  // return await TreePhotoModel.bulkCreate(await Promise.all(treePhotos), {
  //   updateOnDuplicate: Object.keys(
  //     TreePhotoModel.rawAttributes
  //   ) as (keyof TreePhoto)[],
  // });
  const added = [];
  for (const treePhoto of treePhotos) {
    added.push(TreePhotoModel.upsert(treePhoto));
  }
  const result = await Promise.allSettled(added);
  return result.reduce((prev: string[], curr) => {
    if (curr.status === "fulfilled") return prev.concat([curr.value[0].id]);
    return prev;
  }, []);
};

export const bulkDeleteTreePhotos = async (ids: string[]) => {
  // return await TreeModel.bulkCreate(trees, {
  //   updateOnDuplicate: Object.keys(TreeModel.rawAttributes) as (keyof Tree)[],
  // });
  const deleted = [];
  for (const id of ids) {
    deleted.push(
      new Promise<string>((resolve, reject) => {
        TreePhotoModel.destroy({ where: { id } })
          .then(() => {
            resolve(id);
          })
          .catch((err) => {
            reject(err);
          });
      })
    );
  }
  const result = await Promise.allSettled(deleted);
  return result.reduce((prev: string[], curr) => {
    if (curr.status === "fulfilled") return prev.concat([curr.value]);
    return prev;
  }, []);
};

export const createTreePhoto = async (
  photo: TreePhoto & { buffer?: string }
) => {
  if (!photo?.buffer) {
    console.error("An uploaded image has no buffer!");
    return;
  }
  const resizedPhoto = await resizeImage(Buffer.from(photo.buffer, "base64"));
  photo.fullUrl = await uploadImage(resizedPhoto.full);
  photo.thumbUrl = await uploadImage(resizedPhoto.thumb);
  delete photo.buffer, photo.id;
  const result = (await TreePhotoModel.create(photo)).get();
  return result;
};

export interface TreePhotoParams {
  id?: string;
  ids?: string[];
  treeId?: string;
  purposeName?: string;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: TreePhotoParams) => {
  const { id, ids, treeId, purposeName, limit, offset } = params;
  const query: any = {
    where: {},
    returning: true,
  };
  if (id) {
    query.where.id = {
      [Op.eq]: id,
    };
  }
  if (ids) {
    query.where.id = {
      [Op.in]: ids,
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

export const editTreePhoto = async (
  treePhoto: Partial<TreePhoto>,
  params: TreePhotoParams
) => {
  const result = (
    await TreePhotoModel.update(treePhoto, constructQuery(params))
  )[1][0].get();
  return result;
};

export const getTreePhotos = async (params: TreePhotoParams) => {
  const query = constructQuery(params);
  return await TreePhotoModel.findAll(query);
};

export const deleteTreePhotos = async (params: TreePhotoParams) => {
  const query = constructQuery(params);
  return await TreePhotoModel.destroy(query);
};
