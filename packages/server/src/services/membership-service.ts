import { Membership, MembershipRoles } from "@ong-forestry/schema";
import MembershipModel from "db/models/membership";
import { Op } from "sequelize";

export const createMembership = async (membership: Membership) => {
  await MembershipModel.create(membership);
};

export interface GetMembershipsParams {
  id?: string;

  teamId?: string;
  userId?: string;

  role?: MembershipRoles;

  offset?: number;
  limit?: number;
}

export const getMemberships = async (params: GetMembershipsParams) => {
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
  const memberships = MembershipModel.findAll(query);
  return memberships;
};
