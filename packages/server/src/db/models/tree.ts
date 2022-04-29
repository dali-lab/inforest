import { DataTypes } from "sequelize";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Default,
} from "sequelize-typescript";
import Plot from "db/models/plot";
import TreeSpecies from "db/models/tree-species";
import {
  Tree as ITree,
  TreeSpecies as ITreeSpecies,
  Plot as IPlot,
} from "@ong-forestry/schema";

@Table({
  tableName: "trees",
  indexes: [
    {
      name: "absolute_position",
      fields: ["lat", "long"],
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
  @Default(DataTypes.UUID)
  @Column(DataTypes.UUID)
  id: string;

  @Column(DataTypes.STRING)
  tag: string;

  @ForeignKey(() => Plot)
  @AllowNull(false)
  @Column(DataTypes.STRING)
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
}

export default Tree;
