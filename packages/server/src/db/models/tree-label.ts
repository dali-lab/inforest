import {
  TreeCensus as ITreeCensus,
  TreeLabel as ITreeLabel,
} from "@ong-forestry/schema";
import TreeCensusLabel from "db/models/tree-census-label";
import TreeCensus from "db/models/tree-census";

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

  @BelongsToMany(() => TreeCensus, () => TreeCensusLabel)
  censusEntries: ITreeCensus[];
}

export default TreeLabel;
