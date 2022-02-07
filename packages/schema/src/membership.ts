import { User } from "user";
import { Team } from "team";

/**
 * Enum of possible roles a user can have within a team
 */
export enum MembershipRoles {
  Admin = "ADMIN",
  Member = "MEMBER",
}

/**
 * Through-table to connect Users and Teams.
 */
export interface Membership {
  // The PK of the through table entity
  id: string;

  // The User to be connected
  user: User;

  // ID of connected user
  userId: number;

  // The Team the User belongs to
  team: Team;

  // ID of connected team
  teamId: number;

  // Role of the user within that specific team
  role: MembershipRoles;
}
