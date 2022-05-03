import { Forest } from "@ong-forestry/schema";
import ForestModel from "db/models/forest";
import { Op } from "sequelize";

export const createForest = async (forest: Forest) => {
  return await ForestModel.create(forest);
};

export interface GetForestsParams {
  id?: string;
  name?: string;

  teamId?: string;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: GetForestsParams) => {
  const { id, name, teamId, limit, offset } = params;
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
  return query;
};

export const editForests = async (
  forest: Partial<Forest>,
  params: GetForestsParams
) => {
  const query = constructQuery(params);
  return await ForestModel.update(forest, query);
};

export const getForests = async (params: GetForestsParams) => {
  const query = constructQuery(params);
  return await ForestModel.findAll(query);
};

export const deleteForests = async (params: GetForestsParams) => {
  const query = constructQuery(params);
  return await ForestModel.destroy(query);
};
