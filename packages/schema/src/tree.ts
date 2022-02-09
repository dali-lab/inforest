import { Plot } from "./plot";
import { Trip } from "./trip";

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
  lat: number;
  /**
   * Tree absolute longitude measured in decimal degrees.
   */
  long: number;
  /**
   * Tree relative position along plot width measured in meters.
   */
  plotX: number;
  /**
   * Tree relative position along plot length measured in meters.
   */
  plotY: number;
  /**
   * Tree diameter breast height in centimeters.
   */
  dbh: number;
  /**
   * Tree height in meters.
   */
  height: number;
  /**
   * Object of the tree status.
   */
  status: TreeStatus;
  /**
   * Name of the tree status.
   */
  statusName: string;
  /**
   * Object of the tree species.
   */
  species: TreeSpecies;
  /**
   * Identifying code of the tree species.
   */
  speciesCode: string;
  /**
   * Tree photos.
   */
  photos: TreePhoto[];
  // Trip this entry was collected during
  trip: Trip;
  // ID of this entry's trip
  tripId: string;
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
