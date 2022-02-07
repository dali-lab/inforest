import { Plot } from "./plot";

/**
 * Recorded tree in the forest.
 */
export interface Tree {
  /**
   * Tree tag.
   */
  tag: string;
  /**
   * Number of the plot where the tree is located.
   */
  plotNumber: number;
  /**
   * Object of the plot where the tree is located.
   */
  plot: Plot;
  /**
   * Tree absolute latitude measured in decimal degrees.
   */
  lat?: number;
  /**
   * Tree absolute longitude measured in decimal degrees.
   */
  long?: number;
  /**
   * Tree relative position along plot width measured in meters.
   */
  plotX?: number;
  /**
   * Tree relative position along plot length measured in meters.
   */
  plotY?: number;
  /**
   * Tree diameter breast height in centimeters.
   */
  dbh?: number;
  /**
   * Tree height in meters.
   */
  height?: number;
  /**
   * Object of the tree status.
   */
  status?: TreeStatus;
  /**
   * ID of the tree status.
   */
  statusId?: string;
  /**
   * Object of the tree species.
   */
  species?: TreeSpecies;
  /**
   * ID of the tree species.
   */
  speciesId?: string;
  /**
   * Tree photos.
   */
  photos: TreePhoto[];
}

export interface TreeStatus {
  name: string;
  trees: Tree[];
}

export interface TreeSpecies {
  code: string;
  name: string;
  genus: string;
  commonName: string;
  trees: Tree[];
}

export interface TreePhoto {
  id: string;
  url: string;
  treeTag: string;
  tree: Tree;
  purposeName: string;
  purpose: TreePhotoPurpose;
}

export interface TreePhotoPurpose {
  name: string;
  photos: TreePhoto[];
}
