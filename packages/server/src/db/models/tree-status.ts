import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  HasMany,
} from "sequelize-typescript";
import Tree from "db/models/tree";
import { Tree as ITree, TreeStatus as ITreeStatus } from "@ong-forestry/schema";

@Table({
  tableName: "tree_statuses",
})
class TreeStatus extends Model<ITreeStatus> implements ITreeStatus {
  @PrimaryKey
  @Column(DataTypes.STRING)
  name: string;

  @HasMany(() => Tree)
  trees: ITree[];
}

export default TreeStatus;
