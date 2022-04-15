import { TreeCensus } from "./tree-census";
import { ForestCensus } from "./forest-census";
import { Plot } from "./plot";
import { User } from "./user";

/**
 * A "generation" of census data for the trees in a specific plot
 */
export interface PlotCensus {
  /**
   * This census' ID
   */
  id: string;

  /**
   * This census' approval status.
   */
  approved: boolean;

  /**
   * Plot censused.
   */
  plot: Plot;

  /**
   * Plot number of the plot censused.
   */
  plotNumber: string;

  /**
   * Forest census this plot census belongs to
   */
  forestCensus: ForestCensus;

  /**
   * ID of plot census' forest census
   */
  forestCensusId: string;

  /**
   * Users assigned to census this plot
   */
  authors: User[];

  /**
   * Tree censuses taken during this plot census
   */
  treeCensuses: TreeCensus[];
}

/**
 * Throughtable connecting a plot census to the users in the team assigned to census the plot
 */
export interface PlotCensusAssignment {
  /**
   * Assignment ID
   */
  id: string;

  /**
   * The plot census contributed to by the user
   */
  plotCensus: PlotCensus;

  /**
   * The ID of the plot census
   */
  plotCensusId: string;

  /**
   * The user censusing the plot in this census generation
   */
  user: User;

  /**
   * User's ID
   */
  userId: string;
}
