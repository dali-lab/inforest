import { User } from "user"
import { Team } from "team"

/**
 * Through-table to connect Users and Teams.
 */
export interface Membership  {
    //The User to be connected
    user: User;

    //The Team the User belongs to
    team: Team;
    
}