import { Tree, TreeLabel, TreePhoto } from "./tree";
import { User } from "./user";
import { PlotCensus } from "./plot-census";

/**
 * Census entry of a tree in the forest.
 */
export interface TreeCensus {
  /**
   *
   */
  id: string;

  /**
   * Id of the tree being censused.
   */
  treeId: string;

  /**
   * Object of the tree being censused.
   */
  tree?: Tree;

  /**
   * Tree diameter breast height in centimeters.
   */
  dbh: number;

  /**
   * Labels.
   */
  labels?: TreeLabel[];

  /**
   * Tree photos.
   */
  photos?: TreePhoto[];

  /**
   * Whether this tree has been flagged for review.
   */
  flagged: boolean;

  /**
   * Plot census this entry was taken during
   */
  plotCensus?: PlotCensus;

  /**
   * ID of plot census
   */
  plotCensusId: string;

  /**
   * Object of the user who created this entry.
   */
  author?: User;

  /**
   * ID of the user who created this entry.
   */
  authorId: string;

  /**
   * Date and time when this entry was created.
   */
  createdAt?: Date;

  /**
   * Date and time when this entry was last updated.
   */
  updatedAt?: Date;
}
