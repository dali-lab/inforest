import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AllowNull,
  HasMany,
} from "sequelize-typescript";
import Plot from "db/models/plot";
import TreeSpecies from "db/models/tree-species";
import TreeCensus from "db/models/tree-census";
import {
  Tree as ITree,
  TreeSpecies as ITreeSpecies,
  Plot as IPlot,
  TreeCensus as ITreeCensus,
} from "@ong-forestry/schema";

@Table({
  tableName: "trees",
  indexes: [
    {
      name: "absolute_position",
      fields: ["latitude", "longitude"],
    },
    {
      name: "relative_position",
      fields: ["plotX", "plotY"],
    },
  ],
})
class Tree
  extends Model<ITree>
  implements Omit<ITree, "createdAt" | "updatedAt">
{
  @PrimaryKey
  @Column(DataTypes.STRING)
  tag: string;

  @ForeignKey(() => Plot)
  @AllowNull(false)
  @Column(DataTypes.UUID)
  plotId: string;

  @BelongsTo(() => Plot)
  plot: IPlot;

  @Column(DataTypes.FLOAT)
  latitude: number;

  @Column(DataTypes.FLOAT)
  longitude: number;

  @Column(DataTypes.FLOAT)
  plotX: number;

  @Column(DataTypes.FLOAT)
  plotY: number;

  @ForeignKey(() => TreeSpecies)
  @Column(DataTypes.STRING)
  speciesCode: string;

  @BelongsTo(() => TreeSpecies)
  species: ITreeSpecies;

  @HasMany(() => TreeCensus)
  censuses: ITreeCensus[];
}

export default Tree;
