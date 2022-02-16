import { Forest } from "@ong-forestry/schema";
import ForestModel from "db/models/forest";
import { Op } from "sequelize";

export const createForest = async (forest: Forest) => {
  await ForestModel.create(forest);
};

export interface GetForestsParams {
  id?: string;
  name?: string;

  teamId?: string;

  limit?: number;
  offset?: number;
}

export const getForests = async (params: GetForestsParams) => {
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
  const forests = await ForestModel.findAll(query);
  return forests;
};
