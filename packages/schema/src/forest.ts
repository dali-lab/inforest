import { ForestCensus } from "forest-census";
import { Plot } from "./plot";
import { Team } from "./team";
import { Trip } from "./trip";
/**
 * Set of plots managed by a team
 */
export interface Forest {
  /**
   * Forest ID
   */
  id: string;

  /**
   * Forest Name
   */
  name: string;

  /**
   * Forest description, likely containing some descriptive and identifying info.
   */
  description: string;

  /**
   * Plots contained within this forest
   */
  plots: Plot[];

  /**
   * Team this forest belongs to
   */
  team: Team;

  /**
   * ID of team this forest belongs to
   */
  teamId: string;

  /**
   * Trips undertaken in this forest
   */
  trips: Trip[];

  /**
   * Censuses made on this forest.
   */
  censuses: ForestCensus[];
}
