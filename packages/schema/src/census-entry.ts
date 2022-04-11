import { Tree, TreeLabel, TreePhoto } from "tree";
import { Trip } from "trip";
import { User } from "user";

/**
 * Census entry of a tree in the forest.
 */
export interface CensusEntry {
  /**
   *
   */
  id: string;

  /**
   * Tag of the tree being censused.
   */
  treeTag: string;

  /**
   * Object of the tree being censused.
   */
  tree: Tree;

  /**
   * Tree diameter breast height in centimeters.
   */
  dbh?: number;

  /**
   * Tree height in meters.
   */
  height?: number;

  /**
   * Labels.
   */
  labels?: TreeLabel[];

  /**
   * Tree photos.
   */
  photos: TreePhoto[];

  /**
   * Trip this entry was collected during
   */
  trip: Trip;

  /**
   * ID of this entry's trip
   */
  tripId: string;

  /**
   * Object of the user who created this entry.
   */
  author: User;

  /**
   * ID of the user who created this entry.
   */
  authorId: string;

  /**
   * Date and time when this entry was created.
   */
  createdAt: Date;

  /**
   * Date and time when this entry was last updated.
   */
  updatedAt: Date;
}
