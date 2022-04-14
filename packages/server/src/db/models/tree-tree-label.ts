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
  TreeCensus as ITreeCensus,
  TreeLabel as ITreeLabel,
  TreeTreeLabel as ITreeTreeLabel,
} from "@ong-forestry/schema";
import TreeCensus from "db/models/tree-census";
import TreeLabel from "db/models/tree-label";

@Table({
  tableName: "tree_tree_label",
})
class TreeTreeLabel extends Model<ITreeTreeLabel> implements ITreeTreeLabel {
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column(DataTypes.UUID)
  id: string;

  @Column(DataTypes.UUID)
  @ForeignKey(() => TreeCensus)
  treeCensusId: string;

  @BelongsTo(() => TreeCensus)
  treeCensus: ITreeCensus;

  @Column(DataTypes.STRING)
  @ForeignKey(() => TreeLabel)
  treeLabelCode: string;

  @BelongsTo(() => TreeLabel)
  treeLabel: ITreeLabel;
}

export default TreeTreeLabel;
