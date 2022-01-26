import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  HasMany,
  Default,
  AllowNull,
} from "sequelize-typescript";
import Tree from "db/models/tree";
import { Tree as ITree, TreeStatus as ITreeStatus } from "@ong-forestry/schema";

@Table({
  tableName: "tree_status",
})
class TreeStatus extends Model<ITreeStatus> implements ITreeStatus {
  @PrimaryKey
  @Column({ type: DataTypes.UUID })
  @Default(DataTypes.UUIDV4)
  id?: string;

  @HasMany(() => Tree)
  trees?: ITree[];

  @Column(DataTypes.STRING)
  @AllowNull(false)
  name?: string;
}

export default TreeStatus;
