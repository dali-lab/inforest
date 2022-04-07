import { Tree as ITree, TreeLabel as ITreeLabel } from "@ong-forestry/schema";
import Tree from "db/models/tree";
import TreeTreeLabel from "db/models/tree-tree-label";

import {
  BelongsToMany,
  Column,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { DataTypes } from "sequelize";

@Table({ tableName: "tree-labels" })
class TreeLabel extends Model<ITreeLabel> implements ITreeLabel {
  @PrimaryKey
  @Column(DataTypes.STRING)
  code: string;

  @Column(DataTypes.STRING)
  description: string;

  @BelongsToMany(() => Tree, () => TreeTreeLabel)
  trees: ITree[];
}

export default TreeLabel;
