import { Plot } from "./plot";
import { TreeCensus } from "./tree-census";

/**
 * Tree in the forest.
 */
export interface Tree {
  /**
   * Tree id.
   */
  id: string;

  /**
   * Tree tag.
   */
  tag: string;

  /**
   * ID of the plot where the tree is located.
   */
  plotId: string;

  /**
   * Object of the plot where the tree is located.
   */
  plot: Plot;

  /**
   * Tree absolute latitude measured in decimal degrees.
   */
  latitude: number;

  /**
   * Tree absolute longitude measured in decimal degrees.
   */
  longitude: number;

  /**
   * Tree relative position along plot width measured in meters.
   */
  plotX: number;

  /**
   * Tree relative position along plot length measured in meters.
   */
  plotY: number;

  /**
   * Object of the tree species.
   */
  species?: TreeSpecies;

  /**
   * Identifying code of the tree species.
   */
  speciesCode: string;

  /**
   * Object of census conducted on this tree.
   */
  censuses?: TreeCensus[];

  /**
   * The initial tree census that this tree was created with
   */
  initCensus?: TreeCensus | null;

  /**
   * The id of the initial tree census
   */

  initCensusId: string | null;

  /**
   * Date and time when this entry was created.
   */
  createdAt?: Date;

  /**
   * Date and time when this entry was last updated.
   */
  updatedAt?: Date;
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
  type?: TreeSpeciesTypes;

  /**
   * Entries for trees of this species
   */
  trees?: Tree[];
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
   * The census entries that have this label
   */
  censusedTrees?: TreeCensus[];
}

/**
 * Through-table to connect Trees to TreeLabels.
 */
export interface TreeCensusLabel {
  /**
   * The PK of the through table entity
   */
  id: string;

  /**
   * The ID of the census entry
   */
  treeCensusId: string;

  /**
   * The object of the census entry
   */
  treeCensus?: TreeCensus;

  /**
   * The code of the tree's TreeLabel
   */
  treeLabelCode: string;

  /**
   * The tree's TreeLabel
   */
  treeLabel?: TreeLabel;
}

export interface TreePhoto {
  /**
   * Tree photo ID
   */
  id: string;

  /**
   * URL link to full-sized photo
   */
  fullUrl: string;

  /**
   * URL link to minified, thumbnail version of the photo
   */
  thumbUrl: string;

  /**
   * ID of census entry this photograph belongs to
   */
  treeCensusId: string;

  /**
   * Object of the census entry this photograph belongs to
   */
  treeCensus?: TreeCensus;

  /**
   * Name/foreign key of photo's associated purpose
   */
  purposeName: string | null;

  /**
   * Photo's full associated purpose
   */
  purpose?: TreePhotoPurpose;
}

export interface TreePhotoPurpose {
  /**
   * Name/Title of this purpose
   */
  name: string;

  /**
   * Photos with this purpose
   */
  photos?: TreePhoto[];
}
