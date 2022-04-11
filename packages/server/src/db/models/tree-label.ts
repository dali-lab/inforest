import {
  CensusEntry as ICensusEntry,
  TreeLabel as ITreeLabel,
} from "@ong-forestry/schema";
import TreeTreeLabel from "db/models/tree-tree-label";
import CensusEntry from "db/models/census-entry";

import {
  BelongsToMany,
  Column,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { DataTypes } from "sequelize";

@Table({ tableName: "tree_labels" })
class TreeLabel extends Model<ITreeLabel> implements ITreeLabel {
  @PrimaryKey
  @Column(DataTypes.STRING)
  code: string;

  @Column(DataTypes.STRING)
  description: string;

  @BelongsToMany(() => CensusEntry, () => TreeTreeLabel)
  censusEntries: ICensusEntry[];
}

export default TreeLabel;
