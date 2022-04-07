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
} from "sequelize-typescript";
import Plot from "db/models/plot";
import TreeStatus from "db/models/tree-status";
import TreeSpecies from "db/models/tree-species";
import TreePhoto from "db/models/tree-photo";
import TreeLabel from "db/models/tree-label";
import Trip from "db/models/trip";
import User from "db/models/user";

import {
  Tree as ITree,
  TreePhoto as ITreePhoto,
  TreeSpecies as ITreeSpecies,
  TreeStatus as ITreeStatus,
  TreeLabel as ITreeLabel,
  Trip as ITrip,
  Plot as IPlot,
  User as IUser,
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
  @Column(DataTypes.STRING)
  tag: string;

  @ForeignKey(() => Plot)
  @AllowNull(false)
  @Column(DataTypes.STRING)
  plotNumber: string;

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

  @Column(DataTypes.FLOAT)
  dbh: number;

  @Column(DataTypes.FLOAT)
  height: number;

  @ForeignKey(() => TreeSpecies)
  @Column(DataTypes.STRING)
  speciesCode: string;

  @BelongsTo(() => TreeSpecies)
  species: ITreeSpecies;

  @ForeignKey(() => TreeStatus)
  @Column(DataTypes.STRING)
  statusName: string;

  @BelongsTo(() => TreeStatus)
  status: ITreeStatus;

  // https://sequelize.org/docs/v6/advanced-association-concepts/advanced-many-to-many/
  @BelongsToMany(() => TreeLabel, { through: "tree-tree-label" })
  labels: ITreeLabel[];

  @HasMany(() => TreePhoto)
  photos: ITreePhoto[];

  @ForeignKey(() => Trip)
  @AllowNull(false)
  @Column(DataTypes.STRING)
  tripId: string;

  @BelongsTo(() => Trip)
  trip: ITrip;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataTypes.STRING)
  authorId: string;

  @BelongsTo(() => User)
  author: IUser;
}

export default Tree;
