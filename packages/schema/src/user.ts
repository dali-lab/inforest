import { TreeCensus } from "./tree-census";
import { Team } from "./team";
import { PlotCensus } from "plot-census";
/**
 * App user
 */
export interface User {
  /**
   * User ID
   */
  id?: string;

  /**
   * User's email, also used as a username
   */
  email: string;

  /**
   * User's encrypted password
   */
  password: string;

  /**
   * User's first name
   */
  firstName?: string;

  /**
   * User's last name
   */
  lastName?: string;

  /**
   * True if user has verified their account via email
   */
  verified?: boolean;

  /**
   * False if this user has been added to a team but has not signed up yet
   */
  active?: boolean;

  /**
   * Teams user is a member/admin of
   */
  teams?: Team[];

  /**
   * Census entries authored by the user
   */
  censusedTrees?: TreeCensus[];

  /**
   * Plot censuses the user participated in
   */
  censusedPlots?: PlotCensus[];
}
