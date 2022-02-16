import { User } from "@ong-forestry/schema";
import UserModel from "db/models/user";
import { Op } from "sequelize";

export const createUser = async (user: User) => {
  await UserModel.create(user);
};

export interface GetUsersParams {
  id?: string;
  email?: string;

  limit?: number;
  offset?: number;
}

export const getUsers = async (params: GetUsersParams) => {
  const { id, email, limit = 30, offset = 0 } = params;
  const query: any = {
    where: {},
  };
  if (id) {
    query.where.id = {
      [Op.eq]: id,
    };
  }
  if (email) {
    query.where.email = {
      [Op.eq]: email,
    };
  }
  if (limit) {
    query.limit = limit;
  }
  if (offset) {
    query.offset = offset;
  }
  const users = await UserModel.findAll(query);
  return users;
};
