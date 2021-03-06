import { PlotCensus } from "./plot-census";
import { Forest } from "./forest";
/**
 * Forestry census plot.
 */
export interface Plot {
  /**
   * The ID of this plot.
   */
  id: string;

  /**
   * Plot number.
   */
  number: string;

  /**
   * Plot latitude in decimal degrees.
   */
  latitude: number;

  /**
   * Plot longitude in decimal degrees.
   */
  longitude: number;

  /**
   * Plot length along latitude in meters.
   */
  length: number;

  /**
   * Plot width along longitude in meters.
   */
  width: number;

  /**
   * Forest this plot belongs to
   */
  forest?: Forest;

  /**
   * ID of plot's forest
   */
  forestId: string;

  /**
   * Censuses made on this plot.
   */
  censuses?: PlotCensus[];
}
