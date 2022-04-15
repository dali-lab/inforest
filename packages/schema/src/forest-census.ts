import { PlotCensus } from "./plot-census";
import { Forest } from "./forest";

/**
 * A "generation" of census data for a forest
 */
export interface ForestCensus {
  /**
   * This census' ID
   */
  id: string;

  /**
   * Name assigned to this census
   */
  name: string;

  /**
   * Whether this census is still in progress or finished
   */
  active: boolean;

  /**
   * Forest being censused
   */
  forest: Forest;

  /**
   * ID of the forest censused.
   */
  forestId: string;

  /**
   * Plot censuses that are part of this forest census
   */
  plotCensuses: PlotCensus[];
}
