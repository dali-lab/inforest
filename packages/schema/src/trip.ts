import { Forest } from "./forest";
import { Tree } from "./tree";

/**
 * Possible trip statuses, indicating the state of a trip's data collection and review
 */
export enum TripStatuses {
  /**
   * Indicates that data is still being collected in the field
   */
  Incomplete = "INCOMPLETE",
  /**
   * Indicates that all data has been collected and that admins are reviewing the entries
   */
  InReview = "INREVIEW",
  /**
   * Indicates that the trip is finished and all its data has been reviewed
   */
  Approved = "APPROVED",
}

/**
 * A censusing trip, helping to organize tree entries for review and export.
 */
export interface Trip {
  /**
   * Trip ID
   */
  id: string;

  /**
   * Trip name
   */
  name: string;

  /**
   * Forest where the trip was carried out
   */
  forest: Forest;

  /**
   * ID of Forest
   */
  forestId: string;

  /**
   * Tree entries which are a part of this trip
   */
  entries: Tree[];
}
