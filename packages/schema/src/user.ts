import { Team } from "./team";
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
   * Teams user is a member/admin of
   */
  teams?: Team[];
}
