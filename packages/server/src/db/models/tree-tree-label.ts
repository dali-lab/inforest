import {
  BelongsTo,
  Column,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { DataTypes } from "sequelize";
import {
  Tree as ITree,
  TreeLabel as ITreeLabel,
  TreeTreeLabel as ITreeTreeLabel,
} from "@ong-forestry/schema";
import Tree from "db/models/tree";
import TreeLabel from "db/models/tree-label";

@Table({
  tableName: "tree_tree_label",
})
class TreeTreeLabel extends Model<ITreeTreeLabel> implements ITreeTreeLabel {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column(DataTypes.UUID)
  id: string;

  @Column(DataTypes.STRING)
  @ForeignKey(() => Tree)
  treeTag: string;

  @BelongsTo(() => Tree)
  tree: ITree;

  @Column(DataTypes.STRING)
  @ForeignKey(() => TreeLabel)
  treeLabelCode: string;

  @BelongsTo(() => TreeLabel)
  treeLabel: ITreeLabel;
}

export default TreeTreeLabel;
