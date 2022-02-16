import { Team } from "@ong-forestry/schema";
import TeamModel from "db/models/team";
import { Op } from "sequelize";

export const createTeam = async (team: Team) => {
  await TeamModel.create(team);
};

export interface GetTeamsParams {
  id?: string;
  name?: string;

  limit?: number;
  offset?: number;
}

export const getTeams = async (params: GetTeamsParams) => {
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
  const teams = await TeamModel.findAll(query);
  return teams;
};
