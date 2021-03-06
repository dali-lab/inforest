import { User } from "@ong-forestry/schema";
import UserModel from "db/models/user";
import { Op } from "sequelize";
import bcrypt from "bcrypt";

export const createUser = async (user: Pick<User, "email" | "password">) => {
  // check for inactive account with this email
  // db-level unique constraint on email; can assume only one user if any
  const inactiveUsers = await getUsers({
    email: user.email,
    active: false,
  });

  // if no inactive user is found, create a new one
  if (inactiveUsers.length == 0) {
    // TODO: change verified back to false!
    return await UserModel.create({ ...user, verified: true, active: true });
  }
  // else update this user's information and make them active
  else {
    return await editUsers(
      { ...user, active: true },
      { id: inactiveUsers[0].id }
    );
  }
};

export const createInactiveAccount = async (email: string) => {
  return await UserModel.create({
    email,
    password: "",
    active: false,
    //TODO: change this!
    verified: true,
  });
};

export interface UserParams {
  id?: string;
  email?: string;

  active?: boolean;

  limit?: number;
  offset?: number;
}

const constructQuery = (params: UserParams) => {
  const { id, email, active, limit = 30, offset = 0 } = params;
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
  if (active != undefined) {
    query.where.active = {
      [Op.eq]: active,
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

export const getUsers = async (params: UserParams) => {
  const query = constructQuery(params);
  return await UserModel.findAll(query);
};

export const editUsers = async (user: Partial<User>, params: UserParams) => {
  const query = constructQuery(params);
  return await UserModel.update(user, query);
};

export const deleteUsers = async (params: UserParams) => {
  const query = constructQuery(params);
  return await UserModel.destroy(query);
};

export const isValidPassword = async (email: string, password: string) => {
  const users = await getUsers({ email });
  // get password; getUsers omits it
  const hash = (
    await UserModel.findAll({ where: { email: { [Op.eq]: email } } })
  )[0].password;

  if (users.length == 0 || hash == null) {
    throw new Error("No user exists with this email.");
  }

  return await bcrypt.compare(password, hash);
};
