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

export interface TreeLabel {
  /**
   * This label's code
   */
  code: string;

  /**
   * The meaning of this label and when it should be used
   */
  description: string;

  /**
   * The trees that have this label
   */
  trees: Tree[];
}

/**
 * Through-table to connect Trees to TreeLabels.
 */
export interface TreeTreeLabel {
  /**
   * The PK of the through table entity
   */
  id: string;

  /**
   * The tag of the labeled Tree
   */
  treeTag: string;

  /**
   * The Tree labeled
   */
  tree: Tree;

  /**
   * The code of the tree's TreeLabel
   */
  treeLabelCode: string;

  /**
   * The tree's TreeLabel
   */
  treeLabel: TreeLabel;
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
