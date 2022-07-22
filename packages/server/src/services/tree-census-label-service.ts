import { TreeCensusLabel } from "@ong-forestry/schema";
import TreeCensusLabelModel from "db/models/tree-census-label";
import { Op } from "sequelize";

export const bulkInsertTreeCensusLabels = async (
  treeCensusLabels: TreeCensusLabel[]
) => {
  // return await TreeCensusLabelModel.bulkCreate(treeCensusLabels);
  const added = [];
  for (const treeCensusLabel of treeCensusLabels) {
    added.push(
      new Promise<[TreeCensusLabel, any]>((resolve, reject) =>
        TreeCensusLabelModel.upsert(treeCensusLabel)
          .then((val) => resolve(val))
          .catch((err) => {
            console.log("Error when adding TreeCensusLabel", err);
            reject(err);
          })
      )
    );
  }
  const result = await Promise.allSettled(added);
  return result.reduce((prev: string[], curr) => {
    if (curr.status === "fulfilled") return prev.concat([curr.value[0].id]);
    return prev;
  }, []);
};

export const bulkDeleteTreeCensusLabels = async (ids: string[]) => {
  // return await TreeModel.bulkCreate(trees, {
  //   updateOnDuplicate: Object.keys(TreeModel.rawAttributes) as (keyof Tree)[],
  // });
  const deleted = [];
  for (const id of ids) {
    deleted.push(
      new Promise<string>((resolve, reject) => {
        TreeCensusLabelModel.destroy({ where: { id } })
          .then(() => {
            resolve(id);
          })
          .catch((err) => {
            console.log(`Error when deleting TreeCensusLabel id ${id}:`, err);
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

export const createTreeCensusLabel = async (
  treeCensusLabel: TreeCensusLabel
) => {
  return await TreeCensusLabelModel.create(treeCensusLabel);
};

export interface TreeCensusLabelParams {
  id?: string;
  ids?: string[];
  treeCensusId?: string;
  treeLabelCode?: string;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: TreeCensusLabelParams) => {
  const { id, ids, treeCensusId, treeLabelCode, limit, offset } = params;
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
  if (treeCensusId) {
    query.where.treeCensusId = {
      [Op.eq]: treeCensusId,
    };
  }
  if (treeLabelCode) {
    query.where.treeLabelCode = {
      [Op.eq]: treeLabelCode,
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

export const getTreeCensusLabels = async (params: TreeCensusLabelParams) => {
  const query = constructQuery(params);
  return await TreeCensusLabelModel.findAll(query);
};

export const deleteTreeCensusLabels = async (params: TreeCensusLabelParams) => {
  const result = await TreeCensusLabelModel.destroy(constructQuery(params));
  return result;
};
