import { Team } from "@ong-forestry/schema";
import TeamModel from "db/models/team";
import { Op } from "sequelize";

export const createTeam = async (team: Team) => {
  return await TeamModel.create(team);
};

export interface GetTeamsParams {
  id?: string;
  name?: string;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: GetTeamsParams) => {
  const { id, name, limit = 30, offset = 0 } = params;
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
  if (limit) {
    query.limit = limit;
  }
  if (offset) {
    query.offset = offset;
  }
  return query;
};

export const editTeams = async (
  team: Partial<Team>,
  params: GetTeamsParams
) => {
  const query = constructQuery(params);
  return await TeamModel.update(team, query);
};

export const getTeams = async (params: GetTeamsParams) => {
  const query = constructQuery(params);
  return await TeamModel.findAll(query);
};

export const deleteTeams = async (params: GetTeamsParams) => {
  const query = constructQuery(params);
  return await TeamModel.destroy(query);
};
