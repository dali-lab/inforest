import { Team } from "@ong-forestry/schema";
import TeamModel from "db/models/team";
import UserModel from "db/models/user";
import { Op } from "sequelize";

export const createTeam = async (team: Team) => {
  return await TeamModel.create(team);
};

export interface TeamParams {
  id?: string;
  name?: string;
  userId?: string;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: TeamParams) => {
  const { id, name, userId, limit = 30, offset = 0 } = params;
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
  if (userId) {
    query.include = [{ model: UserModel, attributes: ["id"] }];
    query.where["$members->Membership.userId$"] = userId;
  }
  if (limit) {
    query.limit = 100;
  }
  if (offset) {
    query.offset = 0;
  }
  return query;
};

export const editTeams = async (team: Partial<Team>, params: TeamParams) => {
  const query = constructQuery(params);
  return await TeamModel.update(team, query);
};

export const getTeams = async (params: TeamParams) => {
  const query = constructQuery(params);
  return await TeamModel.findAll(query);
};

export const deleteTeams = async (params: TeamParams) => {
  const query = constructQuery(params);
  return await TeamModel.destroy(query);
};
