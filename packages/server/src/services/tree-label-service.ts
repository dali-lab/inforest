import { TreeLabel } from "@ong-forestry/schema";
import TreeLabelModel from "db/models/tree-label";
import { Op } from "sequelize";

export const createTreeLabel = async (treeLabel: TreeLabel) => {
  return await TreeLabelModel.create(treeLabel);
};

export interface TreeLabelParams {
  code?: string;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: TreeLabelParams) => {
  const { code, limit, offset } = params;
  const query: any = {
    where: {},
  };
  if (code) {
    query.where.code = {
      [Op.eq]: code,
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

export const editTreeLabels = async (
  treeLabel: Partial<TreeLabel>,
  params: TreeLabelParams
) => {
  const query = constructQuery(params);
  return await TreeLabelModel.update(treeLabel, query);
};

export const getTreeLabels = async (params: TreeLabelParams) => {
  const query = constructQuery(params);
  return await TreeLabelModel.findAll(query);
};

export const deleteTreeLabels = async (params: TreeLabelParams) => {
  const query = constructQuery(params);
  return await TreeLabelModel.destroy(query);
};
