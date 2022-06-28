import { User } from "./user";
import { Team } from "./team";

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
  /**
   * The PK of the through table entity
   */
  id: string;

  /**
   * The User to be connected (currently not used)
   */
  user?: User;

  /**
   * ID of connected user
   */
  userId: string;

  /**
   * The Team the User belongs to (currently not used)
   */
  team?: Team;

  /**
   * ID of connected team
   */
  teamId: string;

  /**
   * Role of the user within that specific team
   */
  role: MembershipRoles;
}
