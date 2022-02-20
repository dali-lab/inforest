import { User } from "@ong-forestry/schema";
import UserModel from "db/models/user";
import { Op } from "sequelize";
import bcrypt from "bcrypt";

export const createUser = async (user: User) => {
  return await UserModel.create(user);
};

export interface GetUsersParams {
  id?: string;
  email?: string;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: GetUsersParams) => {
  const { id, email, limit = 30, offset = 0 } = params;
  const query: any = {
    where: {},
    attributes: { exclude: ["password"] },
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
  return query;
};

export const getUsers = async (params: GetUsersParams) => {
  const query = constructQuery(params);
  return await UserModel.findAll(query);
};

export const editUsers = async (
  user: Partial<User>,
  params: GetUsersParams
) => {
  const query = constructQuery(params);
  return await UserModel.update(user, query);
};

export const deleteUsers = async (params: GetUsersParams) => {
  const query = constructQuery(params);
  return await UserModel.destroy(query);
};

export const isValidPassword = async (email: string, password: string) => {
  const user = await UserModel.findAll({ where: { email } });
  if (user.length !== 1) throw new Error("No user exists with this email.");
  return await bcrypt.compare(password, user[0].password);
};
