import { TreePhotoPurpose } from "@ong-forestry/schema";
import TreePhotoPurposeModel from "db/models/tree-photo-purpose";
import { Op } from "sequelize";

export const createTreePhotoPurpose = async (
  treePhotoPurpose: TreePhotoPurpose
) => {
  return await TreePhotoPurposeModel.create(treePhotoPurpose);
};

export interface TreePhotoPurposeParams {
  name?: string;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: TreePhotoPurposeParams) => {
  const { name, limit, offset } = params;
  const query: any = {
    where: {},
  };

  if (name) {
    query.where.name = {
      [Op.eq]: name,
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

export const editTreePhotoPurposes = async (
  treePhotoPurpose: Partial<TreePhotoPurpose>,
  params: TreePhotoPurposeParams
) => {
  const query = constructQuery(params);
  return await TreePhotoPurposeModel.update(treePhotoPurpose, query);
};

export const getTreePhotoPurposes = async (params: TreePhotoPurposeParams) => {
  const query = constructQuery(params);
  return await TreePhotoPurposeModel.findAll(query);
};

export const deleteTreePhotoPurposes = async (
  params: TreePhotoPurposeParams
) => {
  const query = constructQuery(params);
  return await TreePhotoPurposeModel.destroy(query);
};
