import { Forest } from "@ong-forestry/schema";
import ForestModel from "db/models/forest";
import { Op } from "sequelize";

export const createForest = async (forest: Forest) => {
  return await ForestModel.create(forest);
};

export interface ForestParams {
  id?: string;
  name?: string;

  teamId?: string;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: ForestParams) => {
  const { id, name, teamId, limit, offset } = params;
  const query: any = {
    where: {},
  };
  if (id) {
    query.where.id = {
      [Op.eq]: id,
    };
  }
  if (name) {
    query.where.name = {
      [Op.eq]: name,
    };
  }
  if (teamId) {
    query.where.teamId = {
      [Op.eq]: teamId,
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

export const editForests = async (
  forest: Partial<Forest>,
  params: ForestParams
) => {
  const query = constructQuery(params);
  return await ForestModel.update(forest, query);
};

export const getForests = async (params: ForestParams) => {
  const query = constructQuery(params);
  return await ForestModel.findAll(query);
};
