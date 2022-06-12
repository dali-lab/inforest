import { TreeCensusLabel } from "@ong-forestry/schema";
import TreeCensusLabelModel from "db/models/tree-census-label";
import { Op } from "sequelize";

export const bulkInsertTreeCensusLabels = async (
  treeCensusLabels: TreeCensusLabel[]
) => {
  return await TreeCensusLabelModel.bulkCreate(treeCensusLabels, {
    updateOnDuplicate: Object.keys(
      TreeCensusLabelModel.rawAttributes
    ) as (keyof TreeCensusLabel)[],
  });
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
  console.log(result);
  return result;
};
