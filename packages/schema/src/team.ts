import {User} from "user"
/**
 * Censusing Team
 * A group of users that census together (i.e. a research team). Allows for collaboration and review of census data.
 */
export interface Team {
    // Team ID
    id: string
    // Team name
    name: string
    // Description / summary of team
    description: string
    // List of admin Users, who will be able to review/revise data
    admins: User[]
    // List of non-admin Users, who will be able to contribute data to the Team
    members: User[]

}