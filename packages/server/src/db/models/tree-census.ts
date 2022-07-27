import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
  AllowNull,
  BelongsToMany,
  Default,
  HasOne,
  BeforeUpdate,
} from "sequelize-typescript";
import Tree from "db/models/tree";
import TreePhoto from "db/models/tree-photo";
import TreeLabel from "db/models/tree-label";
import TreeCensusLabel from "db/models/tree-census-label";
import User from "db/models/user";
import PlotCensus from "db/models/plot-census";
import {
  Tree as ITree,
  TreeCensus as ITreeCensus,
  PlotCensus as IPlotCensus,
  TreePhoto as ITreePhoto,
  TreeLabel as ITreeLabel,
  User as IUser,
} from "@ong-forestry/schema";

@Table({
  tableName: "tree_census",
  indexes: [
    {
      name: "dbh",
      fields: ["dbh"],
    },
  ],
})
class TreeCensus
  extends Model<ITreeCensus>
  implements Omit<ITreeCensus, "createdAt" | "updatedAt">
{
  @PrimaryKey
  @Default(DataTypes.UUIDV4)
  @Column(DataTypes.UUID)
  id: string;

  @ForeignKey(() => Tree)
  @AllowNull(false)
  @Column(DataTypes.STRING)
  treeId: string;

  @BelongsTo(() => Tree, { onDelete: "CASCADE" })
  tree: ITree;

  @Column(DataTypes.FLOAT)
  dbh: number;

  @BelongsToMany(() => TreeLabel, () => TreeCensusLabel)
  labels: ITreeLabel[];

  @HasMany(() => TreePhoto, { onDelete: "CASCADE" })
  photos: ITreePhoto[];

  @Column(DataTypes.BOOLEAN)
  flagged: boolean;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  authorId: string;

  @BelongsTo(() => User)
  author: IUser;

  @ForeignKey(() => PlotCensus)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  plotCensusId: string;

  @BelongsTo(() => PlotCensus, { onDelete: "CASCADE" })
  plotCensus: IPlotCensus;

  @HasOne(() => Tree, { onDelete: "SET NULL" })
  initTree: ITree;

  @Column(DataTypes.STRING)
  notes: string;

  // @BeforeUpdate
  // static async flagIfNoSpecies(instance: ITreeCensus) {
  //   if (
  //     !instance?.treeId ||
  //     !(await Tree.findByPk(instance.treeId))?.speciesCode
  //   ) {
  //     instance.flagged = true;
  //   }
  // }
}

export default TreeCensus;
