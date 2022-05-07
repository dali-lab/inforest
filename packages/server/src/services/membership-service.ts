import { Membership, MembershipRoles } from "@ong-forestry/schema";
import MembershipModel from "db/models/membership";
import { Op } from "sequelize";
import { getUsers, createInactiveAccount } from "services";

const uuid = require("uuid4");

export const createMembership = async (membership: {
  email: string;
  teamId: string;
}) => {
  // check whether user with this email exists
  const users = await getUsers({ email: membership.email });

  // no user with this email exists. create inactive user account
  if (users.length == 0) {
    users.push(await createInactiveAccount(membership.email));
  }

  return await MembershipModel.create({
    id: uuid(),
    userId: users[0].id,
    teamId: membership.teamId,
  });
};

export interface GetMembershipsParams {
  id?: string;

  teamId?: string;
  userId?: string;

  role?: MembershipRoles;

  offset?: number;
  limit?: number;
}

const constructQuery = (params: GetMembershipsParams) => {
  const { id, teamId, userId, role, offset, limit } = params;
  const query: any = {
    where: {},
  };
  if (id) {
    query.where.id = {
      [Op.eq]: id,
    };
  }
  if (teamId) {
    query.where.teamId = {
      [Op.eq]: teamId,
    };
  }
  if (userId) {
    query.where.userId = {
      [Op.eq]: userId,
    };
  }
  if (role) {
    query.where.role = {
      [Op.eq]: role,
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
export const editMemberships = async (
  membership: Partial<Membership>,
  params: GetMembershipsParams
) => {
  const query = constructQuery(params);
  return await MembershipModel.update(membership, query);
};

export const getMemberships = async (params: GetMembershipsParams) => {
  const query = constructQuery(params);
  return await MembershipModel.findAll(query);
};

export const deleteMemberships = async (params: GetMembershipsParams) => {
  const query = constructQuery(params);
  return await MembershipModel.destroy(query);
};
