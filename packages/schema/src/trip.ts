import { CensusEntry } from "./census-entry";
import { Forest } from "./forest";

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
  InReview = "IN_REVIEW",
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
   * Census entries made on this trip
   */
  censusEntries: CensusEntry[];
}
