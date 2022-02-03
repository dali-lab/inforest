/**
 * Forestry census plot.
 */
export interface Plot {
  /**
   * Plot number.
   */
  number: number;
  /**
   * Plot name.
   */
  name: string;
  /**
   * Plot latitude in decimal degrees.
   */
  lat: number;
  /**
   * Plot longitude in decimal degrees.
   */
  long: number;
  /**
   * Plot length along latitude in meters.
   */
  length: number;
  /**
   * Plot width along longitude in meters.
   */
  width: number;
}
