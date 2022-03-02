import { User } from "./user";
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
  plotNumber: string;

  /**
   * Object of the plot where the tree is located.
   */
  plot: Plot;

  /**
   * Tree absolute latitude measured in decimal degrees.
   */
  latitude?: number;

  /**
   * Tree absolute longitude measured in decimal degrees.
   */
  longitude?: number;

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
   * Name of the tree status.
   */
  statusName?: string;

  /**
   * Object of the tree species.
   */
  species?: TreeSpecies;

  /**
   * Identifying code of the tree species.
   */
  speciesCode?: string;

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

  author: User;

  authorId: string;
}

export interface TreeStatus {
  /**
   * Status's name
   */
  name: string;

  /**
   * Tree entries possessing this status
   */
  trees: Tree[];
}

export enum TreeSpeciesTypes {
  Conifer = "CONIFER",
  Deciduous = "DECIDUOUS",
}

export interface TreeSpecies {
  /**
   * Code used by researchers as a shorthand for the species
   */
  code: string;

  /**
   * Species name
   */
  name: string;

  /**
   * Family the species belongs to
   */
  family: string;

  /**
   * Genus the species belongs to
   */
  genus: string;

  /**
   * Common, non-Latin name
   */
  commonName: string;

  /**
   * Species type
   */
  type: TreeSpeciesTypes;

  /**
   * Entries for trees of this species
   */
  trees: Tree[];
}

export interface TreePhoto {
  /**
   * Tree photo ID
   */
  id: string;

  /**
   * URL link to photo
   */
  url: string;

  /**
   * Tag of tree being photographed
   */
  treeTag: string;

  /**
   * Tree entry this photo belongs to
   */
  tree: Tree;

  /**
   * Name/foreign key of photo's associated purpose
   */
  purposeName: string;

  /**
   * Photo's full associated purpose
   */
  purpose: TreePhotoPurpose;
}

export interface TreePhotoPurpose {
  /**
   * Name/Title of this purpose
   */
  name: string;

  /**
   * Photos with this purpose
   */
  photos: TreePhoto[];
}
